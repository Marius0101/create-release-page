import { OctokitHttpError, OctokitRequest, OctokitResponse } from "./models";

export function isOctokitHttpError(error: any): error is OctokitHttpError {
    return (
        error &&
        typeof error.name === 'string' &&
        typeof error.message === 'string' &&
        typeof error.status === 'number' &&
        isOctokitResponse(error.response) &&
        isOctokitRequest(error.request)
    );
  }
export function isOctokitResponse(response: any): response is OctokitResponse {
    return (
        response &&
        typeof response.url === 'string' &&
        typeof response.status === 'number' &&
        typeof response.headers === 'object'&&
        response.headers !== null &&
        Object.entries(response.headers).every(
            ([key, value]) => typeof key === 'string' && typeof value === 'string'
        ) &&
        response.data !== undefined
    );
}

export function isOctokitRequest(request: any): request is OctokitRequest {
    return (
        request &&
        typeof request.method === 'string' &&
        typeof request.url === 'string' &&
        typeof request.headers === 'object'&&
        request.headers !== null &&
        Object.entries(request.headers).every(
            ([key, value]) => typeof key === 'string' && typeof value === 'string'
        ) 
    );
}