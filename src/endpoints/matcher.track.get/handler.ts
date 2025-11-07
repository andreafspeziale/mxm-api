import { MxmAPIError } from '../../mxm-api.error.js';
import type {
  EndpointPayload,
  MxmAPIResponse,
} from '../../mxm-api.interfaces.js';
import {
  apiKeySchema,
  buildLegacyAPIResponseSchema,
  successStatusCodeSchema,
} from '../../mxm-api.schemas.js';
import {
  buildHeaders,
  buildUrl,
  handleRequest,
  handleResponse,
  throwAPIError,
} from '../../mxm-api.utils.js';
import { MATCHER_TRACK_GET_ENDPOINT } from './constants.js';
import type {
  MatcherTrackGetPayload,
  MxmAPIMatcherTrackGetResponse,
} from './interfaces.js';
import { mxmAPIMatcherTrackGetResponseSchema } from './schema.js';

export const matcherTrackGet = async ({
  payload: { apiKey, ...rest },
  client,
  logger,
}: EndpointPayload<MatcherTrackGetPayload>): Promise<
  MxmAPIResponse<MxmAPIMatcherTrackGetResponse>
> => {
  const method = 'GET';
  const endpoint = buildUrl(MATCHER_TRACK_GET_ENDPOINT, rest);

  logger?.info(
    {
      fn: matcherTrackGet.name,
      method,
      endpoint,
      payload: rest,
      ...(apiKey ? { apiKey } : {}),
    },
    'Getting track by matcher...',
  );

  const { statusCode, data } = await handleRequest({
    client: client,
    method,
    path: endpoint,
    headers: buildHeaders(
      await apiKeySchema.parseAsync(apiKey).catch((error: unknown) =>
        throwAPIError({
          message: 'API key is required',
          details: {
            method,
            path: endpoint,
            cause: error,
          },
          logger,
          errorToBeInitialized: MxmAPIError,
        }),
      ),
    ),
    logger,
    errorToBeInitialized: MxmAPIError,
  });

  return handleResponse({
    method,
    path: endpoint,
    statusCode,
    data,
    statusCodeSchema: successStatusCodeSchema,
    dataSchema: buildLegacyAPIResponseSchema(
      mxmAPIMatcherTrackGetResponseSchema,
    ),
    logger,
    errorToBeInitialized: MxmAPIError,
  });
};
