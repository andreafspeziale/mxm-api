import type { z } from 'zod';
import type { mxmAPITrackLyricsGetResponseSchema } from './schema.js';

export type TrackLyricsGetPayload = {
  commontrack_id?: string;
  track_isrc?: string;
} & ({ commontrack_id: string } | { track_isrc: string });

export type MxmAPITrackLyricsGetResponse = z.infer<
  typeof mxmAPITrackLyricsGetResponseSchema
>;
