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
import { TRACK_GET_ENDPOINT } from './constants.js';
import type {
  MxmAPITrackGetResponse,
  TrackGetGetPayload,
} from './interfaces.js';
import { mxmAPITrackGetResponseSchema } from './schema.js';

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
    dataSchema: buildLegacyAPIResponseSchema(mxmAPITrackGetResponseSchema),
    logger,
    errorToBeInitialized: MxmAPIError,
  });
};
