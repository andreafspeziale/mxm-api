import type { APIErrorDetails } from './mxm-api.interfaces.js';

class APIError extends Error {
  details: Omit<APIErrorDetails, 'cause'>;

  constructor(message: string, { cause, ...rest }: APIErrorDetails) {
    super(message);

    this.name = APIError.name;
    this.details = rest;
    // this.cause = cause; // NOTE: maybe a little bit too much, this would be like the "original error"
  }
}

export class MxmAPIError extends APIError {}
