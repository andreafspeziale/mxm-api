import {
  type EndpointPayload,
  MxmAPIError,
  type MxmAPIResponse,
} from '../../.';
import {
  apiKeySchema,
  buildLegacyAPIResponseSchema,
  successStatusCodeSchema,
} from '../../mxm-api.schemas';
import {
  buildHeaders,
  buildUrl,
  handleRequest,
  handleResponse,
  throwAPIError,
} from '../../mxm-api.utils';
import { MATCHER_LYRICS_GET_ENDPOINT } from './constants';
import type {
  MatcherLyricsGetPayload,
  MxmAPIMatcherLyricsGetResponse,
} from './interfaces';
import { mxmAPIMatcherLyricsGetResponseSchema } from './schema';

export const matcherLyricsGet = async ({
  payload: { apiKey, ...rest },
  client,
  logger,
}: EndpointPayload<MatcherLyricsGetPayload>): Promise<
  MxmAPIResponse<MxmAPIMatcherLyricsGetResponse>
> => {
  const method = 'GET';
  const endpoint = buildUrl(MATCHER_LYRICS_GET_ENDPOINT, rest);

  logger?.info(
    {
      fn: matcherLyricsGet.name,
      method,
      endpoint,
      payload: rest,
      ...(apiKey ? { apiKey } : {}),
    },
    'Getting lyric by matcher...',
  );

  const { statusCode, data } = await handleRequest({
    client: client,
    method,
    path: endpoint,
    headers: buildHeaders(
      await apiKeySchema.parseAsync(apiKey).catch((error) =>
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
      mxmAPIMatcherLyricsGetResponseSchema,
    ),
    logger,
    errorToBeInitialized: MxmAPIError,
  });
};
