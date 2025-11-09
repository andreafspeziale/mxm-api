import t from 'tap';
import { MockAgent, setGlobalDispatcher } from 'undici';
import { MxmAPIError } from '../../mxm-api.error.js';
import { buildUrl } from '../../mxm-api.utils.js';
import { METHOD, TRACK_LYRICS_GET_ENDPOINT } from './constants.js';
import { trackLyricsGet } from './handler.js';

const url = 'http://some-fake-url.example.com';
const mockAgent = new MockAgent();
mockAgent.disableNetConnect();

setGlobalDispatcher(mockAgent);

const client = mockAgent.get(url);

t.test('matcher.lyrics.get', (t) => {
  t.test('Should return the expected response', async (t) => {
    const expectedResponse = {
      message: {
        header: {
          status_code: 200,
          execute_time: 0.345,
        },
        body: {
          // TODO: check this fields using an API key with Scale plan
          lyrics: {
            explicit: 1,
            lyrics_body: 'Hello my friend...',
            lyrics_copyright:
              'Writer(s): Andrea Speziale\nCopyright: Fake Publishing Ltd.\nLyrics powered by www.musixmatch.com',
            lyrics_id: 1,
            lyrics_language: 'en',
            pixel_tracking_url: 'https://tracking.musixmatch.com/.../...',
            region_restriction: {
              allowed: ['XW'],
              blocked: [],
            },
            script_tracking_url: 'https://tracking.musixmatch.com/.../...',
            updated_time: '2025-04-29T13:45:21Z',
          },
        },
      },
    };

    const payload = {
      apiKey: 'fake-api-key',
      track_isrc: 'USUM71703861',
    };

    const path = await buildUrl({
      endpoint: TRACK_LYRICS_GET_ENDPOINT,
      params: payload,
      method: METHOD,
      errorToBeInitialized: MxmAPIError,
    });

    client
      .intercept({
        path,
        method: METHOD,
      })
      .reply(200, expectedResponse);

    const r = await trackLyricsGet({
      payload,
      client,
    });

    t.strictSame(r, expectedResponse, 'Should return the expected response');
  });

  t.test('Should throw when api-key is not provided', async (t) => {
    const payload = {
      track_isrc: 'USUM71703861',
    };

    await t.rejects(
      trackLyricsGet({
        payload,
        client,
      }),
      {
        message: 'API key is required',
      },
    );
  });

  t.test('Should throw when unexpected statusCode', async (t) => {
    const statusCode = 500;

    const payload = {
      apiKey: 'fake-api-key',
      track_isrc: 'USUM71703861',
    };

    const path = await buildUrl({
      endpoint: TRACK_LYRICS_GET_ENDPOINT,
      params: payload,
      method: METHOD,
      errorToBeInitialized: MxmAPIError,
    });

    client
      .intercept({
        path,
        method: METHOD,
      })
      .reply(statusCode, {});

    await t.rejects(
      trackLyricsGet({
        payload,
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

      const payload = {
        apiKey: 'fake-api-key',
        track_isrc: 'USUM71703861',
      };

      const path = await buildUrl({
        endpoint: TRACK_LYRICS_GET_ENDPOINT,
        params: payload,
        method: METHOD,
        errorToBeInitialized: MxmAPIError,
      });

      client
        .intercept({
          path,
          method: METHOD,
        })
        .reply(200, response);

      await t.rejects(
        trackLyricsGet({
          payload,
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
            lyrics: {
              explicit: 1,
              lyrics_body: 'Hello my friend...',
              lyrics_copyright:
                'Writer(s): Andrea Speziale\nCopyright: Fake Publishing Ltd.\nLyrics powered by www.musixmatch.com',
              lyrics_id: '1',
              lyrics_language: 'en',
              pixel_tracking_url: 'https://tracking.musixmatch.com/.../...',
              script_tracking_url: 'https://tracking.musixmatch.com/.../...',
              updated_time: '2025-04-29T13:45:21Z',
            },
          },
        },
      };

      const payload = {
        apiKey: 'fake-api-key',
        track_isrc: 'USUM71703861',
      };

      const path = await buildUrl({
        endpoint: TRACK_LYRICS_GET_ENDPOINT,
        params: payload,
        method: METHOD,
        errorToBeInitialized: MxmAPIError,
      });

      client
        .intercept({
          path,
          method: METHOD,
        })
        .reply(200, response);

      await t.rejects(
        trackLyricsGet({
          payload,
          client,
        }),
        {
          message: 'Unexpected response data shape',
        },
      );
    },
  );

  t.test('Should throw for an unexpected error', async (t) => {
    const payload = {
      apiKey: 'fake-api-key',
      track_isrc: 'USUM71703861',
    };

    const path = await buildUrl({
      endpoint: TRACK_LYRICS_GET_ENDPOINT,
      params: payload,
      method: METHOD,
      errorToBeInitialized: MxmAPIError,
    });

    client
      .intercept({
        path,
        method: METHOD,
      })
      .replyWithError(new Error('Unexpected error'));

    await t.rejects(
      trackLyricsGet({
        payload,
        client,
      }),
      {
        message: 'Something went wrong during the request',
      },
    );
  });

  t.end();
});
