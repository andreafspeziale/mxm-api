import type { z } from 'zod';
import type { mxmAPIMatcherSubtitleGetResponseSchema } from './schema.js';

export type MatcherSubtitleGetPayload = {
  track_isrc?: string;
  q_track?: string;
  q_artist?: string;
  f_subtitle_length?: string;
  f_subtitle_length_max_deviation?: string;
} & ({ track_isrc: string } | { q_track: string; q_artist: string }) &
  (
    | { f_subtitle_length?: never; f_subtitle_length_max_deviation?: never }
    | { f_subtitle_length: string; f_subtitle_length_max_deviation: string }
  );

export type MxmAPIMatcherSubtitleGetResponse = z.infer<
  typeof mxmAPIMatcherSubtitleGetResponseSchema
>;
