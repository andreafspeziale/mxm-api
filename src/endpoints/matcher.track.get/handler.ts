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
import { MATCHER_TRACK_GET_ENDPOINT, METHOD } from './constants.js';
import type {
  MatcherTrackGetPayload,
  MxmAPIMatcherTrackGetResponse,
} from './interfaces.js';
import { mxmAPIMatcherTrackGetResponseSchema } from './schema.js';

export const matcherTrackGet = async ({
  payload,
  client,
  logger,
}: EndpointPayload<MatcherTrackGetPayload>): Promise<
  MxmAPIResponse<MxmAPIMatcherTrackGetResponse>
> => {
  logger?.debug(
    {
      fn: matcherTrackGet.name,
      method: METHOD,
      endpoint: MATCHER_TRACK_GET_ENDPOINT,
      payload,
    },
    'Getting track by matcher...',
  );

  const path = await buildUrl({
    endpoint: MATCHER_TRACK_GET_ENDPOINT,
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
      mxmAPIMatcherTrackGetResponseSchema,
    ),
    logger,
    errorToBeInitialized: MxmAPIError,
  });
};
