import type { Logger } from 'pino';
import type { z } from 'zod';
import type { MxmAPIError } from './mxm-api.error.js';
import type {
  AllowedHTTPMethods,
  APIErrorDetails,
  Request,
  Response,
} from './mxm-api.interfaces.js';

export const buildUrl = (
  endpoint: string,
  params: Record<string, string | null | undefined>,
): string => {
  const queryString = Object.entries(params)
    .filter((entry): entry is [string, string] => {
      const [_, value] = entry;
      return value !== null && value !== undefined && value !== '';
    })
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(value)}`,
    )
    .join('&');

  if (!queryString) {
    return endpoint;
  }

  const separator = endpoint.includes('?') ? '&' : '?';
  return `${endpoint}${separator}${queryString}`;
};

export const buildHeaders = (apiKey: string) => ({
  'content-type': 'application/json',
  'x-mxm-token-apikey': apiKey,
});

export const throwAPIError = ({
  message,
  details,
  logger,
  errorToBeInitialized,
}: {
  message: string;
  details: APIErrorDetails;
  logger?: Logger | undefined;
  errorToBeInitialized: typeof MxmAPIError;
}): never => {
  logger?.error({ fn: throwAPIError.name, ...details }, message);

  throw new errorToBeInitialized(message, details);
};

export const handleRequest = async <B>({
  client,
  method,
  path,
  headers,
  body,
  logger,
  errorToBeInitialized,
}: Request<B> & {
  logger?: Logger | undefined;
  errorToBeInitialized: typeof MxmAPIError;
}): Promise<Response> => {
  logger?.debug(
    {
      fn: handleRequest.name,
      method,
      path,
      ...(headers ? { headers } : {}),
      ...(body ? { body } : {}),
    },
    'Handling request...',
  );

  const { statusCode, ...request } = await client
    .request({
      method,
      path,
      ...(headers ? { headers } : {}),
      ...(body ? { body: JSON.stringify(body) } : {}),
    })
    .catch((error: unknown) =>
      throwAPIError({
        message: 'Something went wrong during the request',
        details: {
          method,
          path,
          ...(headers ? { headers } : {}),
          ...(body ? { body } : {}),
          cause: error,
        },
        logger,
        errorToBeInitialized,
      }),
    );

  return {
    statusCode,
    data: await request.body.json().catch((error: unknown) =>
      throwAPIError({
        message: 'Something went wrong during body.json',
        details: {
          method,
          path,
          statusCode,
          ...(headers ? { headers } : {}),
          ...(body ? { body } : {}),
          cause: error,
        },
        logger,
        errorToBeInitialized,
      }),
    ),
  };
};

export const handleResponse = async <T, R>({
  method,
  path,
  statusCode,
  data,
  statusCodeSchema,
  dataSchema,
  logger,
  errorToBeInitialized,
}: {
  method: AllowedHTTPMethods;
  path: string;
  statusCodeSchema: z.ZodSchema<R>;
  dataSchema: z.ZodSchema<T>;
  logger?: Logger | undefined;
  errorToBeInitialized: typeof MxmAPIError;
} & Response): Promise<T> => {
  logger?.debug(
    {
      fn: handleResponse.name,
      method,
      path,
      statusCode,
      data,
    },
    'Handling response...',
  );

  await statusCodeSchema.parseAsync(statusCode).catch((error: unknown) =>
    throwAPIError({
      message: `Unexpected statusCode, received ${statusCode}`,
      details: {
        method,
        path,
        statusCode,
        cause: error,
      },
      logger,
      errorToBeInitialized,
    }),
  );

  return await dataSchema.parseAsync(data).catch((error: unknown) =>
    throwAPIError({
      message: 'Unexpected response data shape',
      details: {
        method,
        path,
        statusCode,
        data,
        cause: error,
      },
      logger,
      errorToBeInitialized,
    }),
  );
};
