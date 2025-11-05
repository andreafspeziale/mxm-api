import type { z } from 'zod';
import type { mxmAPITrackGetResponseSchema } from './schema';

export interface TrackGetGetPayload {
  commontrack_id?: string;
  track_isrc?: string;
}

export type MxmAPITrackGetResponse = z.infer<
  typeof mxmAPITrackGetResponseSchema
>;
