import { z } from 'zod';

export const mxmAPITrackLyricsMoodGetResponse = z.object({
  mood_list: z.array(
    z.object({
      label: z.string(),
      value: z.number(),
    }),
  ),
});
