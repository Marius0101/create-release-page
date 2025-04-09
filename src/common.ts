import * as core from "@actions/core";
import { GitHub } from "@actions/github/lib/utils";
import * as github from "@actions/github";
import { RequestError } from "@octokit/request-error";

const getInputs = async (): Promise<Inputs> => {
  const getInputList = (inputName: string): string[] | undefined => {
    const input = core.getInput(inputName);
    if (input) {
      return input.split(/\s+/).filter((user) => user !== "");
    }
    return undefined;
  };

  const inputs: Inputs = {
    repo: github.context.repo.repo,
    owner: github.context.repo.owner,
    ghToken: core.getInput("token"),
    title: core.getInput("title"),
    head: core.getInput("head"),
    base: core.getInput("base"),
    body: core.getInput("body"),
    assignees: getInputList("assignees"),
    user_reviewers: getInputList("user_reviewers"),
    team_reviewers: getInputList("team_reviewers"),
  };

  if (!inputs.assignees?.length) delete inputs.assignees;
  if (!inputs.user_reviewers?.length) delete inputs.user_reviewers;
  if (!inputs.team_reviewers?.length) delete inputs.team_reviewers;

  return inputs;
};

const createPullRequest = async (
  inputs: Inputs,
  octokit: InstanceType<typeof GitHub>,
): Promise<number> => {
  core.info("Creating the pull request");
  try {
    const response = await octokit.rest.pulls.create({
      owner: inputs.owner,
      repo: inputs.repo,
      head: inputs.head,
      base: inputs.base,
      title: inputs.title,
      body: inputs.body,
    });
    core.info(`Pull request created successfully: ${response.data.html_url}`);
    return response.data.number;
  } catch (error) {
    if (error instanceof Error) {
      const errorMsg = handleRequestError(error);
      core.setFailed(errorMsg);
    } else {
      core.setFailed("Error creating pull request: Unknown error");
    }
    process.exit(1);
  }
};
const assigneUsersToPR = async (
  inputs: Inputs,
  octokit: InstanceType<typeof GitHub>,
  pr_number: number,
): Promise<void> => {
  core.info(`Assign the following user to the PR: ${inputs.assignees} `);
  await octokit.rest.issues.addAssignees({
    repo: inputs.repo,
    owner: inputs.owner,
    issue_number: pr_number,
    assignees: inputs.assignees,
  });
  core.info(`The users were assigned successfully.`);
};
const addReviewersToPR = async (
  inputs: Inputs,
  octokit: InstanceType<typeof GitHub>,
  pr_number: number,
): Promise<void> => {
  try {
    if (inputs.user_reviewers) {
      core.info(
        `Request the following user as reviewers: ${inputs.user_reviewers}`,
      );
    }
    if (inputs.team_reviewers) {
      core.info(
        `Request the following teams as reviewers: ${inputs.team_reviewers}`,
      );
    }
    await octokit.rest.pulls.requestReviewers({
      repo: inputs.repo,
      owner: inputs.owner,
      pull_number: pr_number,
      reviewers: inputs.user_reviewers,
      team_reviewers: inputs.team_reviewers,
    });
    core.info(`The reviewers were requested successfully.`);
  } catch (error) {
    if (error instanceof Error) {
      const errorMsg = handleRequestError(error);
      core.setFailed(errorMsg);
    } else {
      core.info("Error adding the the reviewers: Unknown error");
    }
  }
};

const handleRequestError = (error: Error): string => {
  const requestErr = error as RequestError;
  const data: ErrorDataResponse | undefined = requestErr.response
    ?.data as ErrorDataResponse;

  let errorMsg = "Error creating pull request: ";
  if (data) {
    errorMsg += `${data.message}\n`;
    errorMsg += `Status Code: ${data.status}\n`;

    if (data.errors?.length) {
      errorMsg +=
        "Details: " + data.errors.map((e) => e.message).join("\n") + "\n";
    }

    errorMsg += `GitHub endpoint documentation: ${data.documentation_url}\n`;
  } else {
    errorMsg += "No response data available.";
  }
  return errorMsg;
};
export { getInputs, createPullRequest, assigneUsersToPR, addReviewersToPR };
