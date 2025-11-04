import { OctokitHttpError } from "./models";

export function toOctokitError(error: any): OctokitHttpError {
  return {
    name: error.name,
    message: error.message,
    status: error.status,
    request: error.request
      ? {
          method: error.request.method,
          url: error.request.url,
          headers: error.request.headers
        }
      : undefined,
    response: error.response
      ? {
          url: error.response.url,
          status: error.response.status,
          headers: error.response.headers,
          data: error.response.data,
        }
      : undefined,
    stack: error.stack,
  }
};