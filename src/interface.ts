export interface Inputs {
    repo: string;
    owner: string;
    ghToken: string;
    tag_name: string;
    build_version: string;
    change_log_file: string;
    find_pattern: string;
    name?: string;
    draft?: boolean;
    
  }