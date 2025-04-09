interface Inputs {
  repo: string;
  owner: string;
  ghToken: string;
  title: string;
  head: string;
  base: string;
  body: string;
  assignees?: string[];
  user_reviewers?: string[];
  team_reviewers?: string[];
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
