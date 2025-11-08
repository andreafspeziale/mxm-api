import { pino } from 'pino';
import t from 'tap';
import { MockAgent, setGlobalDispatcher } from 'undici';
import { z } from 'zod';
import { MxmAPIError } from './mxm-api.error.js';
import {
  buildUrl,
  handleRequest,
  handleResponse,
  throwAPIError,
} from './mxm-api.utils.js';

const url = 'http://some-fake-url.example.com';
const mockAgent = new MockAgent();
mockAgent.disableNetConnect();

setGlobalDispatcher(mockAgent);

const client = mockAgent.get(url);

t.test('throwAPIError', (t) => {
  t.test('Should throw MxmAPIError with message and details', async (t) => {
    try {
      throwAPIError({
        message: 'Test error',
        details: {
          method: 'GET',
          path: '/test',
          cause: new Error('Original error'),
        },
        errorToBeInitialized: MxmAPIError,
      });
      t.fail('Should have thrown an error');
    } catch (error) {
      t.ok(error instanceof MxmAPIError);
      t.equal((error as MxmAPIError).message, 'Test error');
      t.ok((error as MxmAPIError).details);
    }
  });

  t.test('Should log error when logger is provided', async (t) => {
    const logger = pino({ level: 'silent' });
    let errorLogged = false;
    logger.error = () => {
      errorLogged = true;
    };

    try {
      throwAPIError({
        message: 'Test error',
        details: {
          method: 'GET',
          path: '/test',
          cause: new Error('Original error'),
        },
        logger,
        errorToBeInitialized: MxmAPIError,
      });
    } catch (_error) {
      t.ok(errorLogged);
    }
  });

  t.end();
});

t.test('buildUrl', (t) => {
  t.test('Should throw when API key is missing', async (t) => {
    await t.rejects(
      buildUrl({
        endpoint: '/test',
        params: {},
        method: 'GET',
        errorToBeInitialized: MxmAPIError,
      }),
      {
        message: 'API key is required',
      },
    );
  });

  t.test('Should throw when API key is undefined', async (t) => {
    await t.rejects(
      buildUrl({
        endpoint: '/test',
        params: { apiKey: undefined },
        method: 'GET',
        errorToBeInitialized: MxmAPIError,
      }),
      {
        message: 'API key is required',
      },
    );
  });

  t.test('Should throw when API key is empty string', async (t) => {
    await t.rejects(
      buildUrl({
        endpoint: '/test',
        params: { apiKey: '' },
        method: 'GET',
        errorToBeInitialized: MxmAPIError,
      }),
      {
        message: 'API key is required',
      },
    );
  });

  t.test('Should build URL with single parameter', async (t) => {
    const url = await buildUrl({
      endpoint: '/test',
      params: { apiKey: 'test-key' },
      method: 'GET',
      errorToBeInitialized: MxmAPIError,
    });

    t.equal(url, '/test?apikey=test-key');
  });

  t.test('Should build URL with multiple parameters', async (t) => {
    const url = await buildUrl({
      endpoint: '/test',
      params: { apiKey: 'test-key', track_id: '123', q_artist: 'Artist Name' },
      method: 'GET',
      errorToBeInitialized: MxmAPIError,
    });

    t.ok(url.includes('apikey=test-key'));
    t.ok(url.includes('track_id=123'));
    t.ok(url.includes('q_artist=Artist%20Name'));
  });

  t.test('Should transform apiKey to apikey in query string', async (t) => {
    const url = await buildUrl({
      endpoint: '/test',
      params: { apiKey: 'test-key' },
      method: 'GET',
      errorToBeInitialized: MxmAPIError,
    });

    t.ok(url.includes('apikey=test-key'));
    t.notOk(url.includes('apiKey'));
  });

  t.test('Should filter out null values', async (t) => {
    const url = await buildUrl({
      endpoint: '/test',
      params: { apiKey: 'test-key', optional: null },
      method: 'GET',
      errorToBeInitialized: MxmAPIError,
    });

    t.equal(url, '/test?apikey=test-key');
    t.notOk(url.includes('optional'));
  });

  t.test('Should filter out undefined values', async (t) => {
    const url = await buildUrl({
      endpoint: '/test',
      params: { apiKey: 'test-key', optional: undefined },
      method: 'GET',
      errorToBeInitialized: MxmAPIError,
    });

    t.equal(url, '/test?apikey=test-key');
    t.notOk(url.includes('optional'));
  });

  t.test('Should filter out empty string values', async (t) => {
    const url = await buildUrl({
      endpoint: '/test',
      params: { apiKey: 'test-key', optional: '' },
      method: 'GET',
      errorToBeInitialized: MxmAPIError,
    });

    t.equal(url, '/test?apikey=test-key');
    t.notOk(url.includes('optional'));
  });

  t.test('Should properly encode special characters', async (t) => {
    const url = await buildUrl({
      endpoint: '/test',
      params: { apiKey: 'test-key', q: 'hello & world' },
      method: 'GET',
      errorToBeInitialized: MxmAPIError,
    });

    t.ok(url.includes('q=hello%20%26%20world'));
  });

  t.test(
    'Should append with ? when endpoint has no query string',
    async (t) => {
      const url = await buildUrl({
        endpoint: '/test',
        params: { apiKey: 'test-key' },
        method: 'GET',
        errorToBeInitialized: MxmAPIError,
      });

      t.ok(url.startsWith('/test?'));
    },
  );

  t.test('Should append with & when endpoint already has ?', async (t) => {
    const url = await buildUrl({
      endpoint: '/test?existing=param',
      params: { apiKey: 'test-key' },
      method: 'GET',
      errorToBeInitialized: MxmAPIError,
    });

    t.ok(url.startsWith('/test?existing=param&'));
    t.ok(url.includes('apikey=test-key'));
  });

  t.test(
    'Should log error when logger is provided and API key is missing',
    async (t) => {
      const logger = pino({ level: 'silent' });
      let errorLogged = false;
      logger.error = () => {
        errorLogged = true;
      };

      await t.rejects(
        buildUrl({
          endpoint: '/test',
          params: {},
          method: 'GET',
          logger,
          errorToBeInitialized: MxmAPIError,
        }),
      );

      t.ok(errorLogged);
    },
  );

  t.end();
});

t.test('handleRequest', (t) => {
  t.test('Should handle successful request', async (t) => {
    const mockResponse = { foo: 'bar' };

    client
      .intercept({
        path: '/test',
        method: 'GET',
      })
      .reply(200, mockResponse);

    const result = await handleRequest({
      client,
      method: 'GET',
      path: '/test',
      errorToBeInitialized: MxmAPIError,
    });

    t.equal(result.statusCode, 200);
    t.same(result.data, mockResponse);
  });

  t.test('Should handle request with headers', async (t) => {
    const mockResponse = { foo: 'bar' };

    client
      .intercept({
        path: '/test',
        method: 'GET',
      })
      .reply(200, mockResponse);

    const result = await handleRequest({
      client,
      method: 'GET',
      path: '/test',
      headers: { 'x-custom-header': 'value' },
      errorToBeInitialized: MxmAPIError,
    });

    t.equal(result.statusCode, 200);
    t.same(result.data, mockResponse);
  });

  t.test('Should throw when request fails', async (t) => {
    client
      .intercept({
        path: '/test',
        method: 'GET',
      })
      .replyWithError(new Error('Network error'));

    await t.rejects(
      handleRequest({
        client,
        method: 'GET',
        path: '/test',
        errorToBeInitialized: MxmAPIError,
      }),
      {
        message: 'Something went wrong during the request',
      },
    );
  });

  t.test('Should throw when body.json() fails', async (t) => {
    client
      .intercept({
        path: '/test',
        method: 'GET',
      })
      .reply(200, 'invalid json', {
        headers: { 'content-type': 'text/plain' },
      });

    await t.rejects(
      handleRequest({
        client,
        method: 'GET',
        path: '/test',
        errorToBeInitialized: MxmAPIError,
      }),
      {
        message: 'Something went wrong during body.json',
      },
    );
  });

  t.test('Should handle POST request with body', async (t) => {
    const mockResponse = { success: true };
    const requestBody = { foo: 'bar', nested: { value: 123 } };

    client
      .intercept({
        path: '/test',
        method: 'POST',
      })
      .reply(200, mockResponse);

    const result = await handleRequest({
      client,
      method: 'POST',
      path: '/test',
      body: requestBody,
      errorToBeInitialized: MxmAPIError,
    });

    t.equal(result.statusCode, 200);
    t.same(result.data, mockResponse);
  });

  t.test('Should serialize body as JSON', async (t) => {
    const mockResponse = { success: true };
    const requestBody = { foo: 'bar', number: 42 };

    client
      .intercept({
        path: '/test',
        method: 'POST',
      })
      .reply(200, mockResponse);

    const result = await handleRequest({
      client,
      method: 'POST',
      path: '/test',
      body: requestBody,
      errorToBeInitialized: MxmAPIError,
    });

    t.equal(result.statusCode, 200);
    t.same(result.data, mockResponse);
  });

  t.test('Should include content-type header by default', async (t) => {
    const mockResponse = { foo: 'bar' };

    client
      .intercept({
        path: '/test',
        method: 'POST',
      })
      .reply(200, mockResponse);

    const result = await handleRequest({
      client,
      method: 'POST',
      path: '/test',
      body: { test: 'data' },
      errorToBeInitialized: MxmAPIError,
    });

    t.equal(result.statusCode, 200);
  });

  t.test('Should log when logger is provided', async (t) => {
    const logger = pino({ level: 'silent' });
    let debugLogged = false;
    logger.debug = () => {
      debugLogged = true;
    };

    const mockResponse = { foo: 'bar' };

    client
      .intercept({
        path: '/test',
        method: 'GET',
      })
      .reply(200, mockResponse);

    await handleRequest({
      client,
      method: 'GET',
      path: '/test',
      logger,
      errorToBeInitialized: MxmAPIError,
    });

    t.ok(debugLogged);
  });

  t.end();
});

t.test('handleResponse', (t) => {
  t.test('Should handle valid response', async (t) => {
    const statusCodeSchema = z.literal(200);
    const dataSchema = z.object({ foo: z.string() });
    const data = { foo: 'bar' };

    const result = await handleResponse({
      method: 'GET',
      path: '/test',
      statusCode: 200,
      data,
      statusCodeSchema,
      dataSchema,
      errorToBeInitialized: MxmAPIError,
    });

    t.same(result, data);
  });

  t.test('Should throw when statusCode is invalid', async (t) => {
    const statusCodeSchema = z.literal(200);
    const dataSchema = z.object({ foo: z.string() });
    const data = { foo: 'bar' };

    await t.rejects(
      handleResponse({
        method: 'GET',
        path: '/test',
        statusCode: 400,
        data,
        statusCodeSchema,
        dataSchema,
        errorToBeInitialized: MxmAPIError,
      }),
      {
        message: 'Unexpected statusCode, received 400',
      },
    );
  });

  t.test('Should throw when data shape is invalid', async (t) => {
    const statusCodeSchema = z.literal(200);
    const dataSchema = z.object({ foo: z.string() });
    const data = { bar: 'baz' };

    await t.rejects(
      handleResponse({
        method: 'GET',
        path: '/test',
        statusCode: 200,
        data,
        statusCodeSchema,
        dataSchema,
        errorToBeInitialized: MxmAPIError,
      }),
      {
        message: 'Unexpected response data shape',
      },
    );
  });

  t.end();
});
