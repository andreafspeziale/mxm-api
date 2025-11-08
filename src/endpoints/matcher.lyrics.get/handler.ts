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
import { MATCHER_LYRICS_GET_ENDPOINT, METHOD } from './constants.js';
import type {
  MatcherLyricsGetPayload,
  MxmAPIMatcherLyricsGetResponse,
} from './interfaces.js';
import { mxmAPIMatcherLyricsGetResponseSchema } from './schema.js';

export const matcherLyricsGet = async ({
  payload,
  client,
  logger,
}: EndpointPayload<MatcherLyricsGetPayload>): Promise<
  MxmAPIResponse<MxmAPIMatcherLyricsGetResponse>
> => {
  logger?.debug(
    {
      fn: matcherLyricsGet.name,
      method: METHOD,
      endpoint: MATCHER_LYRICS_GET_ENDPOINT,
      payload,
    },
    'Getting lyric by matcher...',
  );

  const path = await buildUrl({
    endpoint: MATCHER_LYRICS_GET_ENDPOINT,
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
      mxmAPIMatcherLyricsGetResponseSchema,
    ),
    logger,
    errorToBeInitialized: MxmAPIError,
  });
};
