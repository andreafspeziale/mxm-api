import type { z } from 'zod';
import type { mxmAPITrackLyricsMoodGetResponse } from './schema.js';

export type TrackLyricsMoodGetPayload = {
  commontrack_id?: string;
  track_isrc?: string;
} & ({ commontrack_id: string } | { track_isrc: string });

export type MxmAPITrackLyricsMoodGetResponse = z.infer<
  typeof mxmAPITrackLyricsMoodGetResponse
>;
