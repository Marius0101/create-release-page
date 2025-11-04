import * as github from "@actions/github";
import * as core from "@actions/core";
import {Inputs} from "./interface";
import { GitHub } from "@actions/github/lib/utils";
import {getInputs, getChangeLogContent} from "./common";

const run = async (): Promise<void> =>{
    const inputs:Inputs = await getInputs();
    const octokit = github.getOctokit(inputs.ghToken);
    const changeLogContent: string = await getChangeLogContent(octokit, inputs);
    core.info(`File Content:\n ${changeLogContent}`);
    const versionChanges = getVersionChanges(changeLogContent, inputs.tag_name );
    
    if(!versionChanges)
        core.warning(`No changes found for tag ${inputs.tag_name}. Release page will be created with empty body.`);
    else
        core.info(`Version changes:\n ${versionChanges}`);
    await createReleasePage(octokit, inputs, versionChanges || '');
}

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