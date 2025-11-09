import type { z } from 'zod';
import type { mxmAPIMatcherLyricsGetResponseSchema } from './schema.js';

export type MatcherLyricsGetPayload = {
  track_isrc?: string;
  q_track?: string;
  q_artist?: string;
} & ({ track_isrc: string } | { q_track: string; q_artist: string });

export type MxmAPIMatcherLyricsGetResponse = z.infer<
  typeof mxmAPIMatcherLyricsGetResponseSchema
>;
