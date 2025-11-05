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
import { TRACK_GET_ENDPOINT } from './constants';
import type { MxmAPITrackGetResponse, TrackGetGetPayload } from './interfaces';
import { mxmAPITrackGetResponseSchema } from './schema';

export const trackGet = async ({
  payload: { apiKey, ...rest },
  client,
  logger,
}: EndpointPayload<TrackGetGetPayload>): Promise<
  MxmAPIResponse<MxmAPITrackGetResponse>
> => {
  const method = 'GET';
  const endpoint = buildUrl(TRACK_GET_ENDPOINT, rest);

  logger?.info(
    {
      fn: trackGet.name,
      method,
      path: endpoint,
      payload: rest,
      ...(apiKey ? { apiKey } : {}),
    },
    'Getting track...',
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
    dataSchema: buildLegacyAPIResponseSchema(mxmAPITrackGetResponseSchema),
    logger,
    errorToBeInitialized: MxmAPIError,
  });
};
