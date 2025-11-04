export interface OctokitRequest {
  method: string;
  url: string;
  headers: Record<string, string>;
}

export interface OctokitResponse {
  url: string;
  status: number;
  headers: Record<string, string>;
  data: any;
}

export interface OctokitHttpError {
  name: string;
  message: string;
  status: number;
  request?: OctokitRequest;
  response?: OctokitResponse;
  stack: string;
}