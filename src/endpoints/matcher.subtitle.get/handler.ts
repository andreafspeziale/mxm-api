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
import { MATCHER_SUBTITLE_GET_ENDPOINT, METHOD } from './constants.js';
import type {
  MatcherSubtitleGetPayload,
  MxmAPIMatcherSubtitleGetResponse,
} from './interfaces.js';
import { mxmAPIMatcherSubtitleGetResponseSchema } from './schema.js';

export const matcherSubtitleGet = async ({
  payload,
  client,
  logger,
}: EndpointPayload<MatcherSubtitleGetPayload>): Promise<
  MxmAPIResponse<MxmAPIMatcherSubtitleGetResponse>
> => {
  logger?.debug(
    {
      fn: matcherSubtitleGet.name,
      method: METHOD,
      endpoint: MATCHER_SUBTITLE_GET_ENDPOINT,
      payload,
    },
    'Getting subtitle by matcher...',
  );

  const path = await buildUrl({
    endpoint: MATCHER_SUBTITLE_GET_ENDPOINT,
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
      mxmAPIMatcherSubtitleGetResponseSchema,
    ),
    logger,
    errorToBeInitialized: MxmAPIError,
  });
};
