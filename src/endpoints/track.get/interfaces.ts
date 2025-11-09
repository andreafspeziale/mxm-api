import type { z } from 'zod';
import type { mxmAPITrackGetResponseSchema } from './schema.js';

export type TrackGetGetPayload = {
  commontrack_id?: string;
  track_isrc?: string;
} & ({ commontrack_id: string } | { track_isrc: string });

export type MxmAPITrackGetResponse = z.infer<
  typeof mxmAPITrackGetResponseSchema
>;
