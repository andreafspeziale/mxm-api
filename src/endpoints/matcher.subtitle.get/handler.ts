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
import { MATCHER_SUBTITLE_GET_ENDPOINT } from './constants.js';
import type {
  MatcherSubtitleGetPayload,
  MxmAPIMatcherSubtitleGetResponse,
} from './interfaces.js';
import { mxmAPIMatcherSubtitleGetResponseSchema } from './schema.js';

export const matcherSubtitleGet = async ({
  payload: { apiKey, ...rest },
  client,
  logger,
}: EndpointPayload<MatcherSubtitleGetPayload>): Promise<
  MxmAPIResponse<MxmAPIMatcherSubtitleGetResponse>
> => {
  const method = 'GET';
  const endpoint = buildUrl(MATCHER_SUBTITLE_GET_ENDPOINT, rest);

  logger?.info(
    {
      fn: matcherSubtitleGet.name,
      method,
      endpoint,
      payload: rest,
      ...(apiKey ? { apiKey } : {}),
    },
    'Getting subtitle by matcher...',
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
      mxmAPIMatcherSubtitleGetResponseSchema,
    ),
    logger,
    errorToBeInitialized: MxmAPIError,
  });
};
