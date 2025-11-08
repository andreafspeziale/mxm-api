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
import { METHOD, TRACK_LYRICS_FINGERPRINT_POST_ENDPOINT } from './constants.js';
import type {
  MxmAPITrackLyricsFingerprintPostResponse,
  TrackLyricsFingerprintPostPayload,
} from './interfaces.js';
import { mxmAPITrackLyricsFingerprintPostResponseSchema } from './schema.js';

export const trackLyricsFingerprintPost = async ({
  payload,
  client,
  logger,
}: EndpointPayload<TrackLyricsFingerprintPostPayload>): Promise<
  MxmAPIResponse<MxmAPITrackLyricsFingerprintPostResponse>
> => {
  logger?.debug(
    {
      fn: trackLyricsFingerprintPost.name,
      method: METHOD,
      endpoint: TRACK_LYRICS_FINGERPRINT_POST_ENDPOINT,
      payload,
    },
    'Performing fingerprint by input text...',
  );

  const { text, ...rest } = payload;

  const path = await buildUrl({
    endpoint: TRACK_LYRICS_FINGERPRINT_POST_ENDPOINT,
    params: rest,
    method: METHOD,
    logger,
    errorToBeInitialized: MxmAPIError,
  });

  const { statusCode, data } = await handleRequest({
    client: client,
    method: METHOD,
    path,
    body: { data: { text } },
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
      mxmAPITrackLyricsFingerprintPostResponseSchema,
    ),
    logger,
    errorToBeInitialized: MxmAPIError,
  });
};
