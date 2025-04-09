import * as common from "../src/common";
import * as github from "@actions/github";
import * as core from "@actions/core";
import run from "../src/main";
import { jest, describe, expect } from "@jest/globals";

describe("main run function", () => {
  const mockGetInputs = jest.spyOn(common, "getInputs");
  const mockCreatePullRequest = jest.spyOn(common, "createPullRequest");
  const mockAssigneUsersToPR = jest.spyOn(common, "assigneUsersToPR");
  const mockAddReviewersToPR = jest.spyOn(common, "addReviewersToPR");
  jest.spyOn(core, "info");
  jest.spyOn(core, "setOutput");
  const octokitMock = { rest: { pulls: { create: jest.fn() } } };
  let inputs: Inputs;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(github, "getOctokit").mockReturnValue(octokitMock as any);
    inputs = {
      repo: "testRepo",
      owner: "testOwner",
      ghToken: "testToken",
      title: "testTitle",
      head: "testHead",
      base: "testBase",
      body: "testBody",
    };
    mockCreatePullRequest.mockResolvedValue(1);
  });

  it("Should create pull request when inputs does not contain any assignees or reviewers", async () => {
    //Arrange
    mockGetInputs.mockResolvedValue(inputs);
    mockCreatePullRequest.mockResolvedValue(2);

    //Act
    await run();

    //Assert
    expect(common.createPullRequest).toHaveBeenCalled();
    expect(common.assigneUsersToPR).not.toHaveBeenCalled();
    expect(common.addReviewersToPR).not.toHaveBeenCalled();
    expect(core.info).toHaveBeenNthCalledWith(
      1,
      "No users assigned to this pull request!",
    );
    expect(core.info).toHaveBeenNthCalledWith(
      2,
      "No reviewers added to this pull request!",
    );
    expect(core.setOutput).toBeCalledWith("pr_number",2)
  });

  it("Should assign users when assignees are added", async () => {
    //Arrange
    inputs.assignees = ["user1", "user2"];
    mockGetInputs.mockResolvedValue(inputs);
    mockAssigneUsersToPR.mockResolvedValue();

    //Act
    await run();

    //Assert
    expect(common.createPullRequest).toHaveBeenCalled();
    expect(common.assigneUsersToPR).toHaveBeenCalled();
    expect(common.addReviewersToPR).not.toHaveBeenCalled();
    expect(core.info).not.toBeCalledWith(
      "No users assigned to this pull request!",
    );
    expect(core.info).toHaveBeenNthCalledWith(
      1,
      "No reviewers added to this pull request!",
    );
  });
  it("Should assign users when assignees are added", async () => {
    //Arrange
    inputs.assignees = ["user1", "user2"];
    mockGetInputs.mockResolvedValue(inputs);
    mockAssigneUsersToPR.mockResolvedValue();

    //Act
    await run();

    //Assert
    expect(common.createPullRequest).toHaveBeenCalled();
    expect(common.assigneUsersToPR).toHaveBeenCalled();
    expect(common.addReviewersToPR).not.toHaveBeenCalled();
    expect(core.info).not.toBeCalledWith(
      "No users assigned to this pull request!",
    );
    expect(core.info).toHaveBeenNthCalledWith(
      1,
      "No reviewers added to this pull request!",
    );
  });

  it("Should assign reviewers when user reviewers are added", async () => {
    //Arrange
    inputs.user_reviewers = ["user1", "user2"];
    mockGetInputs.mockResolvedValue(inputs);
    mockAddReviewersToPR.mockResolvedValue();

    //Act
    await run();

    //Assert
    expect(common.createPullRequest).toHaveBeenCalled();
    expect(common.assigneUsersToPR).not.toHaveBeenCalled();
    expect(common.addReviewersToPR).toHaveBeenCalled();
    expect(core.info).toHaveBeenNthCalledWith(
      1,
      "No users assigned to this pull request!",
    );
    expect(core.info).not.toBeCalledWith(
      "No reviewers added to this pull request!",
    );
  });

  it("Should assign reviewers when team reviewers are added", async () => {
    //Arrange
    inputs.team_reviewers = ["user1", "user2"];
    mockGetInputs.mockResolvedValue(inputs);
    mockAddReviewersToPR.mockResolvedValue();

    //Act
    await run();

    //Assert
    expect(common.createPullRequest).toHaveBeenCalled();
    expect(common.assigneUsersToPR).not.toHaveBeenCalled();
    expect(common.addReviewersToPR).toHaveBeenCalled();
    expect(core.info).toHaveBeenNthCalledWith(
      1,
      "No users assigned to this pull request!",
    );
    expect(core.info).not.toBeCalledWith(
      "No reviewers added to this pull request!",
    );
  });

  it("Should assign reviewers when team reviewers and user reviewers are added", async () => {
    //Arrange
    inputs.team_reviewers = ["user1", "user2"];
    inputs.user_reviewers = ["user1", "user2"];
    mockGetInputs.mockResolvedValue(inputs);
    mockAddReviewersToPR.mockResolvedValue();

    //Act
    await run();

    //Assert
    expect(common.createPullRequest).toHaveBeenCalled();
    expect(common.assigneUsersToPR).not.toHaveBeenCalled();
    expect(common.addReviewersToPR).toHaveBeenCalled();
    expect(core.info).toHaveBeenNthCalledWith(
      1,
      "No users assigned to this pull request!",
    );
    expect(core.info).not.toBeCalledWith(
      "No reviewers added to this pull request!",
    );
  });
});
