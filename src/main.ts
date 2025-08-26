import * as github from "@actions/github";
import * as core from "@actions/core";

const run = async (): Promise<void> =>{
    const inputs:Inputs = await getInputs();
    const octokit = github.getOctokit(inputs.ghToken);
    const changeLogContent: string = await getChangeLogContent(octokit, inputs);
    const versionChanges = getVersionChanges(changeLogContent, inputs.build_version, inputs.find_pattern, );
    if(!versionChanges){
        core.warning(`No changes found for version ${inputs.build_version}. Release page will be created with empty body.`);
    }
    await createReleasePage(octokit, inputs, versionChanges || '');
}

const getChangeLogContent = async (octokit: any, inputs: Inputs): Promise<string> => {
    core.info(`Trying to get ${inputs.change_log_file} from the ref ${inputs.tag_name}`);
    const response = octokit.rest.repos.getContent({
        owner: inputs.owner,
        repo: inputs.repo,
        path: inputs.change_log_file,
        ref: inputs.tag_name,
    });
    if(!response.content){
        throw new Error("Unexpected response structure or content missing.");
    }
    core.info(`File content get succesfuly`);
    core.info(`Start decoding the content from base64`);
    const content = Buffer.from(response.content, 'base64').toString('utf-8');
    core.info(`Content decoded succesfuly`);
    return content;
};
const getVersionChanges = (changeLogContent: string, version:string, findPattern: string, ): string|null => {
    const startPattern:string = findPattern.replace('{version}', version);
    const endPattern:string = findPattern.replace('{version}', `\\\d+\\.\\\d+\\.\\\d+`);
    let pattern: string;
    if (version === '1.0.0') {
        pattern = `${startPattern}[^]*$`;
    } else {
        pattern = `${startPattern}[^]*?(?=${endPattern}|$)`;
    }
    const regex = new RegExp(pattern, 'm');
    const match = changeLogContent.match(regex);
    if (!match) {
        core.warning(`Version ${version} not found in the changelog.`);
        return null;
    }
    return match[0].trim();
}
const getInputs = async (): Promise<Inputs> => {
    const ref = process.env.GITHUB_REF_NAME ;
    if (!ref) {
        throw new Error("GITHUB_REF_NAME is not defined in the environment variables.");
    }
    const inputs: Inputs= {
        repo: github.context.repo.repo,
        owner: github.context.repo.owner,
        ghToken: core.getInput("token"),
        tag_name : ref,
        build_version: core.getInput("build_version"),
        change_log_file: core.getInput("change_log_file"),
        name: core.getInput("name") || ref,
        draft: core.getInput("draft").toLowerCase() === 'true',
        find_pattern: core.getInput("find_pattern"),
    }
    core.info(`The name of the release will be ${inputs.name}`);
    return inputs;
}
const createReleasePage = async (octokit: any, inputs: Inputs, body: string): Promise<void> => {
    octokit.rest.repos.createRelease({
    owner:inputs.owner,
    repo:inputs.repo,
    tag_name: inputs.tag_name,
    name:inputs.name,
    body:body,
    draft:inputs.draft,
    });
}

export default run;