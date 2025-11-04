import * as github from "@actions/github";
import * as core from "@actions/core";
import { Inputs } from "../src/interface";
import { getChangeLogContent, getInputs } from "../src/common";


type TestCaseLogs = {
  input: any;
  expected: string[];
};
describe("common.getInputs", () => {
    //#region Variables
    let inputs = {} as any;
    type TestCase = {
        input: any;
        expected: Inputs;
    };
    const baseInput = {
        token: "testToken",
        tag_name: "v1.0.0",
        change_log_file: "CHANGELOG.md",
    };
    const baseExpected = {
        owner: "testOwner",
        repo: "testRepo",
        ghToken: "testToken",
        tag_name: "v1.0.0",
        change_log_file: "CHANGELOG.md",
    };
    const draftCases = [
        ["true", true],
        ["True", true],
        ["TRUE", true],
        ["false", false],
        ["False", false],
        ["FALSE", false],
        ["Random", false],
        ["", false],
    ] as const;
    function makeInput(overrides: Partial<typeof baseInput & { name?: string; draft?: string }>) {
        return { ...baseInput, ...overrides };
    }
    function makeExpected(overrides: Partial<typeof baseExpected & { name?: string; draft: boolean }>) {
        return { ...baseExpected, ...overrides };
    }
    const testcases: TestCase[] = [
    {
        input: makeInput({ name: "Release v1.0.0", draft: "true" }),
        expected: makeExpected({ name: "Release v1.0.0", draft: true }),
    },
        ...draftCases.map(([draftValue, expectedDraft]) => ({
            input: makeInput({ draft: draftValue }),
            expected: makeExpected({ name: baseExpected.tag_name, draft: expectedDraft }),
        })),
    ];
    const testCaseLogs: TestCaseLogs[] = [
        {
            input: makeInput({ name: "Release v1.0.0", draft: "true" }),
            expected: [
            "Getting inputs",
            "The name of the release will be Release v1.0.0",
            ],
        },
        {
            input: makeInput({ draft: "true" }),
            expected: [
            "Getting inputs",
            `The name of the release will be ${baseInput.tag_name}`,
            ],
        },
    ];
    //#endregion
    //#region Hooks
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(core, "info");
        jest.spyOn(core, "getInput").mockImplementation((name: string) => {
            return inputs[name];
        });
        jest.spyOn(github.context, "repo", "get").mockImplementation(() => {
            return {
                owner: "testOwner",
                repo: "testRepo",
            };
        
        });
        inputs = {};
    })
    afterAll(() => {
        jest.restoreAllMocks();
    });
    //#endregion
    //#region Tests
    testcases.forEach(({input, expected}) => {
        it(`getInputs with inputs: ${JSON.stringify(input)} should return expected ${JSON.stringify(expected)}`, async () => {
            //Arrange
            inputs = input;
            //Act   
            const sut: Inputs = await getInputs();
            //Assert
            expect(sut).toEqual(expected);
            expect(core.getInput).toHaveBeenCalledWith("token");
            expect(core.getInput).toHaveBeenCalledWith("tag_name");
            expect(core.getInput).toHaveBeenCalledWith("change_log_file");
            expect(core.getInput).toHaveBeenCalledWith("name");
            expect(core.getInput).toHaveBeenCalledWith("draft");
        });
    });
    testCaseLogs.forEach(({input, expected}) => {

        it(`getInputs with inputs: ${JSON.stringify(input)} should show logs ${JSON.stringify(expected)}`, async () => {
            //Arrange
            inputs = input;
            //Act  
            const sut: Inputs = await getInputs();
            //Assert
            expect(core.info).toHaveBeenCalledTimes(expected.length);
            expected.forEach(msg => {
                expect(core.info).toHaveBeenCalledWith(msg);
            });
        });
    });
    //#endregion
});
// invalid token
// missing file
// no access to repo
// file is not base64 encoded
// file is empty
// file is a directory
// file is too large
// empty path
// file is submodule
// file is symlink
// Branch does not exist
// request failures
// describe("common.getChangeLogContent", () => {
//     it("placeholder", async () => {
//         const octokit = github.getOctokit("testToken");
//         const inputs: Inputs = {
//             owner: "testOwner",
//             repo: "testRepo",
//             ghToken: "testToken",
//             tag_name: "v1.0.0",
//             change_log_file: "CHANGELOG.md",}
//         var test = await getChangeLogContent(octokit, inputs);
//         expect(test).toBeDefined();
//     })
// });