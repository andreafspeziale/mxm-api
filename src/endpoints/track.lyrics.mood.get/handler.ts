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
import { METHOD, TRACK_LYRICS_MOOD_GET_ENDPOINT } from './constants.js';
import type {
  MxmAPITrackLyricsMoodGetResponse,
  TrackLyricsMoodGetPayload,
} from './interfaces.js';
import { mxmAPITrackLyricsMoodGetResponse } from './schema.js';

export const trackLyricsMoodGet = async ({
  payload,
  client,
  logger,
}: EndpointPayload<TrackLyricsMoodGetPayload>): Promise<
  MxmAPIResponse<MxmAPITrackLyricsMoodGetResponse>
> => {
  logger?.debug(
    {
      fn: trackLyricsMoodGet.name,
      method: METHOD,
      endpoint: TRACK_LYRICS_MOOD_GET_ENDPOINT,
      payload,
    },
    'Getting moods...',
  );

  const path = await buildUrl({
    endpoint: TRACK_LYRICS_MOOD_GET_ENDPOINT,
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
    dataSchema: buildLegacyAPIResponseSchema(mxmAPITrackLyricsMoodGetResponse),
    logger,
    errorToBeInitialized: MxmAPIError,
  });
};
