import { z } from 'zod';

export const mxmAPIMatcherSubtitleGetResponseSchema = z.object({
  subtitle: z.object({
    subtitle_id: z.number(),
    subtitle_body: z.string(),
    lyrics_copyright: z.string(),
    region_restriction: z
      .object({
        allowed: z.array(z.string()),
        blocked: z.array(z.string()),
      })
      .optional(), // TODO: this is expected from the docs but is not present in the actual response
    subtitle_length: z.number(),
    subtitle_language: z.string(),
    subtitle_language_description: z.string(),
    script_tracking_url: z.string(),
    pixel_tracking_url: z.string(),
    updated_time: z.string(),
  }),
});
