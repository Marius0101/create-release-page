import * as core from "@actions/core";
import * as github from "@actions/github";
import { GitHub } from "@actions/github/lib/utils";
import {Inputs} from "./interface";
import { RequestError } from "@octokit/request-error";

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
const getChangeLogContent = async (octokit: InstanceType<typeof GitHub>, inputs: Inputs): Promise<string> => {
    core.info(`Trying to get ${inputs.change_log_file} from the ref ${inputs.tag_name}`);
    try {
        const response = await octokit.rest.repos.getContent({
            owner: inputs.owner,
            repo: inputs.repo,
            path: inputs.change_log_file,
            ref: inputs.tag_name,
        });
        if (!("content" in response.data)) {
        core.setFailed("The requested path is not a file or content is missing.");
        process.exit(1);
        }
        core.info(`File content get succesfuly`);
        core.info(`Start decoding the content from base64`);
        const content = Buffer.from(response.data.content, 'base64').toString('utf-8');
        core.info(`Content decoded succesfuly`);
        return content;
    } catch (error) {
        if (error instanceof RequestError) {
            var erro1 = handleRequestError(error);
            core.setFailed(erro1);
        }
        else 
            core.setFailed("Error creating pull request: Unknown error");
        process.exit(1);
    };
}
const handleRequestError = (error: RequestError): string => {
    let errorMsg = "Error creating the release: ";
    if (error) {
        errorMsg += `${error.message}\n`;
        errorMsg += `Status Code: ${error.status}\n`;
        return errorMsg;
    }
    return errorMsg;
}
export {getInputs, getChangeLogContent};