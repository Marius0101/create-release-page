import * as core from "@actions/core";
import * as github from "@actions/github";
import {
  getInputs,
  createPullRequest,
  assigneUsersToPR,
  addReviewersToPR,
} from "./common";

const run = async (): Promise<void> =>{
  const inputs = await getInputs();
  const octokit = github.getOctokit(inputs.ghToken);

  const pr_number: number = await createPullRequest(inputs, octokit);
  core.setOutput("pr_number", pr_number);
  if (inputs.assignees) {
    await assigneUsersToPR(inputs, octokit, pr_number);
  } else {
    core.info("No users assigned to this pull request!");
  }
  if (inputs.team_reviewers || inputs.user_reviewers) {
    await addReviewersToPR(inputs, octokit, pr_number);
  } else {
    core.info("No reviewers added to this pull request!");
  }
  core.info("do somthing");
}
export default run;