import t from 'tap';
import { MockAgent, setGlobalDispatcher } from 'undici';
import { buildUrl } from '../../mxm-api.utils.js';
import { MATCHER_SUBTITLE_GET_ENDPOINT } from './constants.js';
import { matcherSubtitleGet } from './handler.js';

const url = 'http://some-fake-url.example.com';
const mockAgent = new MockAgent();
mockAgent.disableNetConnect();

setGlobalDispatcher(mockAgent);

const client = mockAgent.get(url);

t.test('matcher.subtitle.get', (t) => {
  t.test('Should return the expected response', async (t) => {
    const expectedResponse = {
      message: {
        header: {
          status_code: 200,
          execute_time: 0.345,
        },
        body: {
          subtitle: {
            subtitle_id: 1,
            subtitle_body:
              "[00:07.02] Hello, it's me\n[04:34.43] But it don't matter, it clearly doesn't tear you apart anymore\n[04:42.94] ",
            lyrics_copyright: 'Lyrics powered by www.musixmatch.com',
            subtitle_length: 1,
            subtitle_language: 'en',
            subtitle_language_description: 'English',
            script_tracking_url: 'https://tracking.musixmatch.com/...',
            pixel_tracking_url: 'https://tracking.musixmatch.com/...',
            updated_time: '2024-03-25T21:52:49Z',
          },
        },
      },
    };

    const ISRC = 'THE_ISRC';
    const endpoint = buildUrl(MATCHER_SUBTITLE_GET_ENDPOINT, {
      track_isrc: ISRC,
    });

    client
      .intercept({
        path: endpoint,
        method: 'GET',
      })
      .reply(200, expectedResponse);

    const r = await matcherSubtitleGet({
      payload: {
        apiKey: 'fake-api-key',
        track_isrc: ISRC,
      },
      client,
    });

    t.strictSame(r, expectedResponse, 'Should return the expected response');
  });

  t.test('Should throw when api-key is not provided', async (t) => {
    const ISRC = 'THE_ISRC';

    await t.rejects(
      matcherSubtitleGet({
        payload: {
          track_isrc: ISRC,
        },
        client,
      }),
      {
        message: 'API key is required',
      },
    );
  });

  t.test('Should throw when unexpected statusCode', async (t) => {
    const statusCode = 500;

    const ISRC = 'THE_ISRC';
    const endpoint = buildUrl(MATCHER_SUBTITLE_GET_ENDPOINT, {
      track_isrc: ISRC,
    });

    client
      .intercept({
        path: endpoint,
        method: 'GET',
      })
      .reply(statusCode, {});

    await t.rejects(
      matcherSubtitleGet({
        payload: {
          apiKey: 'fake-api-key',
          track_isrc: ISRC,
        },
        client,
      }),
      {
        message: `Unexpected statusCode, received ${statusCode}`,
      },
    );
  });

  t.test(
    'Should throw when correct statusCode but unexpected response message statusCode',
    async (t) => {
      const response = {
        message: {
          header: {
            status_code: 500,
            execute_time: 0.345,
          },
          body: {},
        },
      };

      const ISRC = 'THE_ISRC';
      const endpoint = buildUrl(MATCHER_SUBTITLE_GET_ENDPOINT, {
        track_isrc: ISRC,
      });

      client
        .intercept({
          path: endpoint,
          method: 'GET',
        })
        .reply(200, response);

      await t.rejects(
        matcherSubtitleGet({
          payload: {
            apiKey: 'fake-api-key',
            track_isrc: ISRC,
          },
          client,
        }),
        {
          message: 'Unexpected response data shape',
        },
      );
    },
  );

  t.test(
    'Should throw when correct statusCode, correct response message statusCode but unexpected response shape',
    async (t) => {
      const response = {
        message: {
          header: {
            status_code: 200,
            execute_time: 0.345,
          },
          body: {
            subtitle: {
              subtitle_id: 1,
              subtitle_body:
                "[00:07.02] Hello, it's me\n[04:34.43] But it don't matter, it clearly doesn't tear you apart anymore\n[04:42.94] ",
              lyrics_copyright: 'Lyrics powered by www.musixmatch.com',
              subtitle_length: '1',
              subtitle_language: 'en',
              subtitle_language_description: 'English',
              script_tracking_url: 'https://tracking.musixmatch.com/...',
              pixel_tracking_url: 'https://tracking.musixmatch.com/...',
              updated_time: '2024-03-25T21:52:49Z',
            },
          },
        },
      };

      const ISRC = 'THE_ISRC';
      const endpoint = buildUrl(MATCHER_SUBTITLE_GET_ENDPOINT, {
        track_isrc: ISRC,
      });

      client
        .intercept({
          path: endpoint,
          method: 'GET',
        })
        .reply(200, response);

      await t.rejects(
        matcherSubtitleGet({
          payload: {
            apiKey: 'fake-api-key',
            track_isrc: ISRC,
          },
          client,
        }),
        {
          message: 'Unexpected response data shape',
        },
      );
    },
  );

  t.test('Should throw for an unexpected error', async (t) => {
    const ISRC = 'THE_ISRC';
    const endpoint = buildUrl(MATCHER_SUBTITLE_GET_ENDPOINT, {
      track_isrc: ISRC,
    });

    client
      .intercept({
        path: endpoint,
        method: 'GET',
      })
      .replyWithError(new Error('Unexpected error'));

    await t.rejects(
      matcherSubtitleGet({
        payload: {
          apiKey: 'fake-api-key',
          track_isrc: ISRC,
        },
        client,
      }),
      {
        message: 'Something went wrong during the request',
      },
    );
  });

  t.end();
});
