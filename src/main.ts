import * as github from "@actions/github";
import * as core from "@actions/core";
import {Inputs} from "./interface";
import { GitHub } from "@actions/github/lib/utils";

const run = async (): Promise<void> =>{
    const inputs:Inputs = await getInputs();
    const octokit = github.getOctokit(inputs.ghToken);
    const changeLogContent: string = await getChangeLogContent(octokit, inputs);
    core.info(`Change log Content:\n ${changeLogContent}`);
    const versionChanges = getVersionChanges(changeLogContent, inputs.tag_name );
     core.info(`Version CHANGES Content:\n ${versionChanges}`);
    if(!versionChanges){
        core.warning(`No changes found for tag ${inputs.tag_name}. Release page will be created with empty body.`);
    }
    await createReleasePage(octokit, inputs, versionChanges || '');
}

const getChangeLogContent = async (octokit: InstanceType<typeof GitHub>, inputs: Inputs): Promise<string> => {
    core.info(`Trying to get ${inputs.change_log_file} from the ref ${inputs.tag_name}`);
    const response = await octokit.rest.repos.getContent({
        owner: inputs.owner,
        repo: inputs.repo,
        path: inputs.change_log_file,
        ref: inputs.tag_name,
    });
    if (!("content" in response.data)) {
    throw new Error("The requested path is not a file or content is missing.");
  }
    core.info(`File content get succesfuly`);
    core.info(`Start decoding the content from base64`);
    const content = Buffer.from(response.data.content, 'base64').toString('utf-8');
    core.info(`Content decoded succesfuly`);
    return content;
};
const getVersionChanges = (changeLogContent: string, tag_name: string): string | null => {
    const tag_split = tag_name.match(/^(\D*)(\d+\.\d+\.\d+(?:-[\w\d]+)?)$/);
    if (tag_split === null) {   
        console.warn(`Tag name ${tag_name} does not match the expected format.`);
        return null;
    }
    const prefix = tag_split[1];
    const escapeRegex = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const versionRegex = /(\d+\.\d+\.\d+(?:-[\w\d]+)?)/g;

    const escapedTag = escapeRegex(tag_name);
    const pattern = new RegExp(
        `${escapedTag}[\\s\\S]*?(?=${escapeRegex(prefix)}${versionRegex.source}|$)`,
    )
    const match = changeLogContent.match(pattern, );
    if (!match) {
        console.warn(`Version ${tag_name} not found in the changelog.`);
        return null;
    }
    return match[0].trim();
}
const getInputs = async (): Promise<Inputs> => {
    core.info(`Getting inputs`);
    const inputs: Inputs= {
        repo: github.context.repo.repo,
        owner: github.context.repo.owner,
        ghToken: core.getInput("token"),
        tag_name : core.getInput("tag_name"),
        change_log_file: core.getInput("change_log_file"),
        name: core.getInput("name") || core.getInput("tag_name"),
        draft: core.getInput("draft").toLowerCase() === 'true'
    }
    core.info(`The name of the release will be ${inputs.name}`);
    return inputs;
}
const createReleasePage = async (octokit: InstanceType<typeof GitHub>, inputs: Inputs, body: string): Promise<void> => {
    await octokit.rest.repos.createRelease({
    owner:inputs.owner,
    repo:inputs.repo,
    tag_name: inputs.tag_name,
    name:inputs.name,
    body:body,
    draft:inputs.draft,
    });
}

export default run;