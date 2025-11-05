import type { z } from 'zod';
import type { mxmAPIMatcherTrackGetResponseSchema } from './schema';

export type MatcherTrackGetPayload =
  | {
      track_isrc: string;
      q_track?: string;
      q_artist?: string;
    }
  | {
      track_isrc?: never;
      q_track: string;
      q_artist: string;
    };

export type MxmAPIMatcherTrackGetResponse = z.infer<
  typeof mxmAPIMatcherTrackGetResponseSchema
>;
