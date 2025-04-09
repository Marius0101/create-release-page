import * as core from "@actions/core";
import * as github from "@actions/github";
import {
  addReviewersToPR,
  assigneUsersToPR,
  createPullRequest,
  getInputs,
} from "../src/common";
import { GitHub } from "@actions/github/lib/utils";
import { RequestError } from "@octokit/request-error";

describe("getInputs tests", () => {
  let inputs = {} as any;
  beforeAll(() => {
    jest.spyOn(core, "getInput").mockImplementation((name: string) => {
      return inputs[name];
    });

    jest.spyOn(github.context, "repo", "get").mockImplementation(() => {
      return {
        owner: "testOwner",
        repo: "testRepo",
      };
    });
  });
  beforeEach(() => {
    inputs = {};
  });
  afterAll(() => {
    jest.restoreAllMocks();
  });
  it("Should return corect inputs when all inputs are provided", async () => {
    //Arrange
    inputs = {
      "token": "testToken",
      title: "testTitle",
      head: "testHead",
      base: "testBase",
      body: "testBody",
      assignees: "user1 user2",
      user_reviewers: "reviewer1 reviewer2",
      team_reviewers: "team1 team2",
    };
    //Act
    const sut: Inputs = await getInputs();

    //Assert
    const expectedInputs: Inputs = {
      owner: "testOwner",
      repo: "testRepo",
      ghToken: "testToken",
      title: "testTitle",
      head: "testHead",
      base: "testBase",
      body: "testBody",
      assignees: ["user1", "user2"],
      user_reviewers: ["reviewer1", "reviewer2"],
      team_reviewers: ["team1", "team2"],
    };
    expect(sut).toEqual(expectedInputs);
  });

  it("Should return empty arrays when assignees,user_reviewers and team_reviewers are empty", async () => {
    //Arrange
    inputs = {
      "token": "testToken",
      title: "testTitle",
      head: "testHead",
      base: "testBase",
      body: "testBody",
      assignees: "",
      user_reviewers: "",
      team_reviewers: "",
    };
    //Act
    const sut: Inputs = await getInputs();

    //Assert
    const expectedInputs: Inputs = {
      owner: "testOwner",
      repo: "testRepo",
      ghToken: "testToken",
      title: "testTitle",
      head: "testHead",
      base: "testBase",
      body: "testBody",
    };
    expect(sut).toEqual(expectedInputs);
  });

  it("Should handle whitespaces correctly", async () => {
    //Arrange
    inputs = {
      "token": "testToken",
      title: "testTitle",
      head: "testHead",
      base: "testBase",
      body: "testBody",
      assignees: "    user1 user2    ",
      user_reviewers: "reviewer1        reviewer2",
      team_reviewers: "    team1     team2    ",
    };
    //Act
    const sut: Inputs = await getInputs();

    //Assert
    const expectedInputs: Inputs = {
      owner: "testOwner",
      repo: "testRepo",
      ghToken: "testToken",
      title: "testTitle",
      head: "testHead",
      base: "testBase",
      body: "testBody",
      assignees: ["user1", "user2"],
      user_reviewers: ["reviewer1", "reviewer2"],
      team_reviewers: ["team1", "team2"],
    };
    expect(sut).toEqual(expectedInputs);
  });
});

describe("createPullRequest tests", () => {
  const mockOctokit = {
    rest: {
      pulls: {
        create: jest.fn(),
      },
    },
  };
  const inputs: Inputs = {
    repo: "testRepo",
    owner: "testOwner",
    ghToken: "testToken",
    title: "testTitle",
    head: "testHead",
    base: "testBase",
    body: "testBody",
  };

  beforeAll(() => {
    jest.spyOn(core, "info");
    jest.spyOn(core, "setFailed");
    jest.spyOn(process, "exit").mockImplementation();
  });

  afterAll(() => {
    jest.clearAllMocks();
  });
  it("Should return PR number on succes", async () => {
    //Arrange
    mockOctokit.rest.pulls.create.mockResolvedValue({
      data: { number: 11, html_url: "https://github.com/test/pr/42" },
    });

    //Act
    const sut = await createPullRequest(
      inputs,
      mockOctokit as unknown as InstanceType<typeof GitHub>,
    );

    //Assert
    expect(sut).toBe(11);
    expect(core.info).toHaveBeenCalledWith("Creating the pull request");
    expect(core.info).toHaveBeenCalledWith(
      "Pull request created successfully: https://github.com/test/pr/42",
    );
  });

  it("Should handle know error", async () => {
    //Arrange
    const data: ErrorDataResponse = {
      message: "Validation Failed",
      status: "422",
      documentation_url:
        "https://docs.github.com/rest/pulls/pulls#create-a-pull-request",
      errors: [
        {
          message:
            "A pull request already exists for Marius0101:feature/add-unit-tests",
          resource: "test",
          code: "test",
        },
      ],
    };
    const requestErr: RequestError = {
      message: "",
      name: "HttpError",
      status: 422,
      request: {
        method: "GET",
        url: "",
        headers: {},
      },
      response: {
        data: data,
        status: 422,
        headers: {},
        url: "",
      },
    };
    const error = new Error("Request failed") as any;
    error.response = requestErr.response;
    mockOctokit.rest.pulls.create.mockRejectedValue(error);

    //Act
    await createPullRequest(
      inputs,
      mockOctokit as unknown as InstanceType<typeof GitHub>,
    );

    //Assert
    expect(core.setFailed).toHaveBeenCalledWith(
      "Error creating pull request: Validation Failed\n" +
        "Status Code: 422\n" +
        "Details: A pull request already exists for Marius0101:feature/add-unit-tests\n" +
        "GitHub endpoint documentation: https://docs.github.com/rest/pulls/pulls#create-a-pull-request\n",
    );
    expect(process.exit).toHaveBeenCalledWith(1);
  });

  it("Should handle unknow error", async () => {
    //Arrange
    mockOctokit.rest.pulls.create.mockRejectedValue("Unknown error");

    //Act
    await createPullRequest(
      inputs,
      mockOctokit as unknown as InstanceType<typeof GitHub>,
    );

    //Assert
    expect(core.setFailed).toHaveBeenCalledWith(
      "Error creating pull request: Unknown error",
    );
    expect(process.exit).toHaveBeenCalledWith(1);
  });
});

describe("assigneUsersToPR tests ", () => {
  const inputs: Inputs = {
    repo: "testRepo",
    owner: "testOwner",
    ghToken: "testToken",
    title: "testTitle",
    head: "testHead",
    base: "testBase",
    body: "testBody",
    assignees: ["user1", "user2"],
  };
  const pr_number = 123;
  const mockOctokit = {
    rest: {
      issues: {
        addAssignees: jest.fn(),
      },
    },
  };
  afterEach(() => {
    jest.clearAllMocks();
  });
  it("Should call addAssignees with correct parameters", async () => {
    //Arrange
    const octokit = mockOctokit as unknown as InstanceType<typeof GitHub>;

    //Act
    await assigneUsersToPR(inputs, octokit, pr_number);

    //Assert
    expect(octokit.rest.issues.addAssignees).toHaveBeenCalledWith({
      repo: "testRepo",
      owner: "testOwner",
      issue_number: pr_number,
      assignees: ["user1", "user2"],
    });
  });
  it("Shoul log appropiate messages", async () => {
    //Arrange
    jest.spyOn(core, "info");
    const pr_number = 123;

    //Act
    await assigneUsersToPR(
      inputs,
      mockOctokit as unknown as InstanceType<typeof GitHub>,
      pr_number,
    );

    //Assert
    expect(core.info).toHaveBeenCalledWith(
      "Assign the following user to the PR: user1,user2 ",
    );
    expect(core.info).toHaveBeenCalledWith(
      "The users were assigned successfully.",
    );
  });
});

describe("addReviewersToPR tests", () => {
  const mockOctokit = {
    rest: {
      pulls: {
        requestReviewers: jest.fn(),
      },
    },
  };
  let coreinfoMock: jest.SpyInstance<void, [message: string], any>;
  const inputs: Inputs = {
    repo: "testRepo",
    owner: "testOwner",
    ghToken: "testToken",
    title: "testTitle",
    head: "testHead",
    base: "testBase",
    body: "testBody",
  };
  const pr_number = 123;
  beforeEach(() => {
    coreinfoMock = jest.spyOn(core, "info");
  });
  afterEach(() => {
    coreinfoMock.mockClear();
    inputs.team_reviewers = undefined;
    inputs.user_reviewers = undefined;
  });
  afterAll(() => {
    jest.clearAllMocks();
  });

  it("Should request reviewers with success", async () => {
    //Arrange
    inputs.user_reviewers = ["user1", "user2"];
    inputs.team_reviewers = ["team1", "team2"];
    const octokit = mockOctokit as unknown as InstanceType<typeof GitHub>;

    await addReviewersToPR(inputs, octokit, pr_number);
    expect(octokit.rest.pulls.requestReviewers).toHaveBeenCalledWith({
      repo: inputs.repo,
      owner: inputs.owner,
      pull_number: pr_number,
      reviewers: inputs.user_reviewers,
      team_reviewers: inputs.team_reviewers,
    });
    expect(core.info).toHaveBeenNthCalledWith(
      1,
      `Request the following user as reviewers: ${inputs.user_reviewers}`,
    );
    expect(core.info).toHaveBeenNthCalledWith(
      2,
      `Request the following teams as reviewers: ${inputs.team_reviewers}`,
    );
    expect(core.info).toHaveBeenNthCalledWith(
      3,
      `The reviewers were requested successfully.`,
    );
  });

  it("Should request user reviewers with success", async () => {
    //Arrange
    inputs.user_reviewers = ["user1", "user2"];
    const octokit = mockOctokit as unknown as InstanceType<typeof GitHub>;

    await addReviewersToPR(inputs, octokit, pr_number);
    expect(octokit.rest.pulls.requestReviewers).toHaveBeenCalledWith({
      repo: inputs.repo,
      owner: inputs.owner,
      pull_number: pr_number,
      reviewers: inputs.user_reviewers,
      team_reviewers: inputs.team_reviewers,
    });
    expect(core.info).toHaveBeenNthCalledWith(
      1,
      `Request the following user as reviewers: ${inputs.user_reviewers}`,
    );
    expect(core.info).toHaveBeenNthCalledWith(
      2,
      `The reviewers were requested successfully.`,
    );
  });
  it("Should request team reviewers with success", async () => {
    //Arrange
    inputs.team_reviewers = ["team1", "team2"];
    const octokit = mockOctokit as unknown as InstanceType<typeof GitHub>;

    await addReviewersToPR(inputs, octokit, pr_number);
    expect(octokit.rest.pulls.requestReviewers).toHaveBeenCalledWith({
      repo: inputs.repo,
      owner: inputs.owner,
      pull_number: pr_number,
      reviewers: inputs.user_reviewers,
      team_reviewers: inputs.team_reviewers,
    });
    expect(core.info).toHaveBeenNthCalledWith(
      1,
      `Request the following teams as reviewers: ${inputs.team_reviewers}`,
    );
    expect(core.info).toHaveBeenNthCalledWith(
      2,
      `The reviewers were requested successfully.`,
    );
  });
});
