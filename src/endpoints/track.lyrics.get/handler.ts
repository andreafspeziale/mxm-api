import { MxmAPIError } from '../../mxm-api.error.js';
import type {
  EndpointPayload,
  MxmAPIResponse,
} from '../../mxm-api.interfaces.js';
import {
  buildLegacyAPIResponseSchema,
  successStatusCodeSchema,
} from '../../mxm-api.schemas.js';
import {
  buildUrl,
  handleRequest,
  handleResponse,
} from '../../mxm-api.utils.js';
import { METHOD, TRACK_LYRICS_GET_ENDPOINT } from './constants.js';
import type {
  MxmAPITrackLyricsGetResponse,
  TrackLyricsGetPayload,
} from './interfaces.js';
import { mxmAPITrackLyricsGetResponseSchema } from './schema.js';

export const trackLyricsGet = async ({
  payload,
  client,
  logger,
}: EndpointPayload<TrackLyricsGetPayload>): Promise<
  MxmAPIResponse<MxmAPITrackLyricsGetResponse>
> => {
  logger?.debug(
    {
      fn: trackLyricsGet.name,
      method: METHOD,
      endpoint: TRACK_LYRICS_GET_ENDPOINT,
      payload,
    },
    'Getting lyrics...',
  );

  const path = await buildUrl({
    endpoint: TRACK_LYRICS_GET_ENDPOINT,
    params: payload,
    method: METHOD,
    logger,
    errorToBeInitialized: MxmAPIError,
  });

  const { statusCode, data } = await handleRequest({
    client: client,
    method: METHOD,
    path,
    logger,
    errorToBeInitialized: MxmAPIError,
  });

  return handleResponse({
    method: METHOD,
    path,
    statusCode,
    data,
    statusCodeSchema: successStatusCodeSchema,
    dataSchema: buildLegacyAPIResponseSchema(
      mxmAPITrackLyricsGetResponseSchema,
    ),
    logger,
    errorToBeInitialized: MxmAPIError,
  });
};
