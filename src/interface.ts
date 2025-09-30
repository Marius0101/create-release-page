export interface Inputs {
    repo: string;
    owner: string;
    ghToken: string;
    tag_name: string;
    change_log_file: string;
    name?: string;
    draft?: boolean;
    
  }