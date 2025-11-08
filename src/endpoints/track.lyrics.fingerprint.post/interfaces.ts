import type { z } from 'zod';
import type { mxmAPITrackLyricsFingerprintPostResponseSchema } from './schema.js';

export interface TrackLyricsFingerprintPostPayload {
  size?: number;
  text: string;
}

export type MxmAPITrackLyricsFingerprintPostResponse = z.infer<
  typeof mxmAPITrackLyricsFingerprintPostResponseSchema
>;
