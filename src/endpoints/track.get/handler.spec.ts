import t from 'tap';
import { MockAgent, setGlobalDispatcher } from 'undici';
import { MxmAPIError } from '../../mxm-api.error.js';
import { buildUrl } from '../../mxm-api.utils.js';
import { METHOD, TRACK_GET_ENDPOINT } from './constants.js';
import { trackGet } from './handler.js';

const url = 'http://some-fake-url.example.com';
const mockAgent = new MockAgent();
mockAgent.disableNetConnect();

setGlobalDispatcher(mockAgent);

const client = mockAgent.get(url);

t.test('track.get', (t) => {
  t.test('Should return the expected response', async (t) => {
    const expectedResponse = {
      message: {
        header: {
          status_code: 200,
          execute_time: 0.345,
        },
        body: {
          track: {
            track_id: 123,
            track_isrc: 'THE_ISRC',
            commontrack_isrcs: [['THE_ISRC']],
            track_spotify_id: 'SPOTIFY_ID',
            track_name: 'Hello',
            track_rating: 1,
            track_length: 1,
            commontrack_id: 1,
            instrumental: 0,
            explicit: 0,
            has_lyrics: 1,
            has_subtitles: 1,
            has_richsync: 1,
            num_favourite: 1,
            album_id: 1,
            album_name: 'ALBUM_NAME',
            artist_id: 1,
            artist_name: 'Andrea',
            album_coverart_100x100:
              'http://s.mxmcdn.net/images-storage/albums/nocover.png',
            album_coverart_350x350: '',
            album_coverart_500x500: '',
            album_coverart_800x800: '',
            track_share_url: 'https://www.musixmatch.com/lyrics/...',
            track_edit_url: 'https://www.musixmatch.com/lyrics/...',
            restricted: 0,
            updated_time: '2025-04-29T13:45:37Z',
            primary_genres: {
              music_genre_list: [
                {
                  music_genre: {
                    music_genre_id: 14,
                    music_genre_parent_id: 34,
                    music_genre_name: 'Pop',
                    music_genre_name_extended: 'Pop',
                    music_genre_vanity: 'Po',
                  },
                },
              ],
            },
          },
        },
      },
    };

    const payload = {
      apiKey: 'fake-api-key',
      track_isrc: 'USUM71703861',
    };

    const path = await buildUrl({
      endpoint: TRACK_GET_ENDPOINT,
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

    const r = await trackGet({
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
      trackGet({
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
      endpoint: TRACK_GET_ENDPOINT,
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
      trackGet({
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
        endpoint: TRACK_GET_ENDPOINT,
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
        trackGet({
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
            track: {
              // track_id: 123,
              track_isrc: 'THE_ISRC',
              commontrack_isrcs: [['THE_ISRC']],
              track_spotify_id: 'SPOTIFY_ID',
              track_name: 'Hello',
              track_rating: 1,
              track_length: 1,
              commontrack_id: 1,
              instrumental: 0,
              explicit: 0,
              has_lyrics: 1,
              has_subtitles: 1,
              has_richsync: 1,
              num_favourite: 1,
              album_id: 1,
              album_name: 'ALBUM_NAME',
              artist_id: 1,
              artist_name: 'Andrea',
              album_coverart_100x100:
                'http://s.mxmcdn.net/images-storage/albums/nocover.png',
              album_coverart_350x350: '',
              album_coverart_500x500: '',
              album_coverart_800x800: '',
              track_share_url: 'https://www.musixmatch.com/lyrics/...',
              track_edit_url: 'https://www.musixmatch.com/lyrics/...',
              restricted: 0,
              updated_time: '2025-04-29T13:45:37Z',
              primary_genres: {
                music_genre_list: [
                  {
                    music_genre: {
                      music_genre_id: 14,
                      music_genre_parent_id: 34,
                      music_genre_name: 'Pop',
                      music_genre_name_extended: 'Pop',
                      music_genre_vanity: 'Po',
                    },
                  },
                ],
              },
            },
          },
        },
      };

      const payload = {
        apiKey: 'fake-api-key',
        track_isrc: 'USUM71703861',
      };

      const path = await buildUrl({
        endpoint: TRACK_GET_ENDPOINT,
        params: payload,
        method: METHOD,
        errorToBeInitialized: MxmAPIError,
      });

      client
        .intercept({
          path,
          method: 'GET',
        })
        .reply(200, response);

      await t.rejects(
        trackGet({
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
      endpoint: TRACK_GET_ENDPOINT,
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
      trackGet({
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
