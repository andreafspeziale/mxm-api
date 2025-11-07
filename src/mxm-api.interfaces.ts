import type { Logger, LoggerOptions } from 'pino';
import type { Client, Interceptable } from 'undici';
import type { UndiciHeaders } from 'undici/types/dispatcher.js';

export type AllowedHTTPMethods = 'GET' | 'POST';

export interface Request<B> {
  client: Client | Interceptable;
  method: AllowedHTTPMethods;
  path: string;
  headers?: UndiciHeaders;
  body?: B;
}

export interface Response {
  statusCode: number;
  data: unknown;
}

export interface APIErrorDetails {
  method: AllowedHTTPMethods;
  path: string;
  statusCode?: number;
  headers?: unknown;
  body?: unknown;
  data?: unknown;
  cause: unknown;
}

export interface MxmAPIOptionalAPIKey {
  apiKey?: string | undefined;
}

export interface MxmAPIConfig extends MxmAPIOptionalAPIKey {
  enableLog?: boolean;
  defaultLoggerConfig?: LoggerOptions;
}

export interface EndpointPayload<T> {
  payload: T & MxmAPIOptionalAPIKey;
  client: Client | Interceptable;
  logger?: Logger | undefined;
}

export interface MxmAPIResponse<T> {
  message: {
    header: {
      status_code: number;
      execute_time: number;
    };
    body: T;
  };
}
