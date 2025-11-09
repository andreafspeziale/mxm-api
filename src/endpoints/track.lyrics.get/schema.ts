import { z } from 'zod';

export const mxmAPITrackLyricsGetResponseSchema = z.object({
  lyrics: z.object({
    explicit: z.number(),
    lyrics_body: z.string(),
    lyrics_copyright: z.string(),
    lyrics_id: z.number(),
    lyrics_language: z.string(),
    pixel_tracking_url: z.string(),
    region_restriction: z
      .object({
        allowed: z.array(z.string()),
        blocked: z.array(z.string()),
      })
      .optional(), // TODO: this is expected from the docs but is not present in the actual response
    script_tracking_url: z.string(),
    updated_time: z.string(),
  }),
});
