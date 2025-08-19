import * as github from "@actions/github";
import * as core from "@actions/core";

const run = async (): Promise<void> =>{
    //const inputs = await getInputs();
    //const octokit = github.getOctokit(inputs.ghToken);
    const octokit = github.getOctokit("your token");
    const changeLogContent: string = await getChangeLogContent(octokit, "CHANGELOG.md", "v1" );
}

const getChangeLogContent = async (octokit: any, filePath: string, ref: string): Promise<string> => {
    core.info(`Trying to get ${filePath} from the ref ${ref}`)
    const response = octokit.rest.repos.getContent({
        owner: 'Marius0101',
        repo: 'create-pull-request',
        path: filePath,
        ref: ref
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


export default run;