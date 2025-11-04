import * as core from "@actions/core";
import * as github from "@actions/github";
import { GitHub } from "@actions/github/lib/utils";
import {Inputs} from "./interface";
import { RequestError } from "@octokit/request-error";
import { OctokitHttpError } from "./temp_lib/models";
import { isOctokitHttpError } from "./temp_lib/validate";
import { toOctokitError } from "./temp_lib/convert";

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
const getChangeLogContent = async (octokit: InstanceType<typeof GitHub>, inputs: Inputs): Promise<string|undefined> => {
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
        if (isOctokitHttpError(error)) {
            // var erro1 = handleRequestError(error);
            var error1:OctokitHttpError = toOctokitError(error);
            handleOctokitHttpError(error1);
            core.setFailed("erro1");
        }
        else 
            console.log(typeof error);
            core.setFailed("Error creating pull request: Unknown error");
        return undefined;
    };
}
const handleOctokitHttpError = (error: OctokitHttpError): string => {
    let errorMsg = "Error creating the release: ";
    if (error) {
        errorMsg += `${error.message}\n`;
        errorMsg += `Status Code: ${error.status}\n`;
        return errorMsg;
    }
    return errorMsg;
}
export {getInputs, getChangeLogContent};