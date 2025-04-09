interface Inputs {
    repo: string;
    owner: string;
    token: string;
    tag_name: string;
    change_log_file: string;
    name: string;
    body:string
  }
interface ErrorDataResponse {
message: string;
errors: Errors[];
documentation_url: string;
status: string;
}
interface Errors {
resource: string;
code: string;
message: string;
}