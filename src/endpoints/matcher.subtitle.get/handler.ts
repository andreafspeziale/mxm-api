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
import { MATCHER_SUBTITLE_GET_ENDPOINT } from './constants';
import type {
  MatcherSubtitleGetPayload,
  MxmAPIMatcherSubtitleGetResponse,
} from './interfaces';
import { mxmAPIMatcherSubtitleGetResponseSchema } from './schema';

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
      mxmAPIMatcherSubtitleGetResponseSchema,
    ),
    logger,
    errorToBeInitialized: MxmAPIError,
  });
};
