import * as core from "@actions/core";
import * as github from "@actions/github";
import {Inputs} from "./interface";

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

export {getInputs};