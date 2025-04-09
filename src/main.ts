import * as github from "@actions/github";
import { createReleasePage, getChangeLog, getInputs } from "./common";

const run = async (): Promise<void> =>{
  const inputs = await getInputs();
  const octokit = github.getOctokit(inputs.token);
  if(inputs.change_log_file){
    inputs.body += await getChangeLog(inputs, octokit)
  }
  await createReleasePage(inputs,octokit);
}
export default run;