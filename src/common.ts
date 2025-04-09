import * as github from "@actions/github";
import * as core from "@actions/core";
import { GitHub } from "@actions/github/lib/utils";
import { RequestError } from "@octokit/request-error";

const getInputs = async (): Promise<Inputs> => {
    const inputs: Inputs = {
        repo: github.context.repo.repo,
        owner: github.context.repo.owner,
        token: core.getInput("token"),
        tag_name: core.getInput("tag_name"),
        change_log_file: core.getInput("change_log_file"),
        name: core.getInput("name"),
        body: core.getInput("body")
    }
    return inputs;
}

const getChangeLog = async(
    inputs:Inputs,
    octokit: InstanceType<typeof GitHub>
    ): Promise<string> => {

    const content = await downloadContentFile(inputs, octokit)
    return GetVersionChanges(content, inputs.tag_name)
}

const downloadContentFile = async(
    inputs:Inputs,
    octokit: InstanceType<typeof GitHub>
):Promise<string> => {

    try{
        core.info(`Trying to get the ${inputs.change_log_file} data from the tag ${inputs.tag_name}:`);
        const response =  await octokit.rest.repos.getContent({
            owner: inputs.owner,
            repo:inputs.repo,
            path: inputs.change_log_file,
            ref: inputs.tag_name
            });

        if (!("content" in response.data) || typeof response.data.content !== "string") {
            throw new Error("Unexpected response structure or content missing.");
        }
        core.info(`File content get succesfuly:`);
        return Buffer.from(response.data.content, 'base64').toString('utf-8');
    }
    catch (error) {
        if (error instanceof Error) {
        const errorMsg = handleRequestError(error);
        core.setFailed(errorMsg);
        } else {
        core.info("Error creating release page: Unknown error");
        }
    } 
    return '';
}

const GetVersionChanges = async (
    content:string,
    tag:string
): Promise<string> =>{
    //TO DO implement
    return content
}

const createReleasePage = async(
    inputs:Inputs,
    octokit: InstanceType<typeof GitHub>)
    : Promise<void> => {

    try{
        await octokit.rest.repos.createRelease({
            owner: inputs.owner,
            repo: inputs.repo,
            tag_name: inputs.tag_name,
            body: inputs.body,
            name: inputs.name
        });
    }
    catch (error) {
        if (error instanceof Error) {
          const errorMsg = handleRequestError(error);
          core.setFailed(errorMsg);
        } else {
          core.info("Error creating release page: Unknown error");
        }
    } 
}

const handleRequestError = (error: Error): string => {
    const requestErr = error as RequestError;
    const data: ErrorDataResponse | undefined = requestErr.response
      ?.data as ErrorDataResponse;
  
    let errorMsg = "Error creating release page: ";
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

export {getInputs, getChangeLog, createReleasePage};