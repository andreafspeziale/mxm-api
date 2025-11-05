import { pino } from 'pino';
import t from 'tap';
import { MockAgent, setGlobalDispatcher } from 'undici';
import { z } from 'zod';
import { MxmAPIError } from './mxm-api.error';
import {
  buildHeaders,
  buildUrl,
  handleRequest,
  handleResponse,
  throwAPIError,
} from './mxm-api.utils';

const url = 'http://some-fake-url.example.com';
const mockAgent = new MockAgent();
mockAgent.disableNetConnect();

setGlobalDispatcher(mockAgent);

const client = mockAgent.get(url);

t.test('buildUrl', (t) => {
  t.test('Should build URL with query parameters', async (t) => {
    const result = buildUrl('/test/endpoint', { foo: 'bar', baz: 'qux' });
    t.equal(result, '/test/endpoint?foo=bar&baz=qux');
  });

  t.test('Should build URL with single query parameter', async (t) => {
    const result = buildUrl('/test/endpoint', { foo: 'bar' });
    t.equal(result, '/test/endpoint?foo=bar');
  });

  t.test('Should return endpoint when no query parameters', async (t) => {
    const result = buildUrl('/test/endpoint', {});
    t.equal(result, '/test/endpoint');
  });

  t.test('Should return endpoint when all params are null', async (t) => {
    const result = buildUrl('/test/endpoint', { foo: null, bar: null });
    t.equal(result, '/test/endpoint');
  });

  t.test('Should return endpoint when all params are undefined', async (t) => {
    const result = buildUrl('/test/endpoint', {
      foo: undefined,
      bar: undefined,
    });
    t.equal(result, '/test/endpoint');
  });

  t.test(
    'Should return endpoint when all params are empty strings',
    async (t) => {
      const result = buildUrl('/test/endpoint', { foo: '', bar: '' });
      t.equal(result, '/test/endpoint');
    },
  );

  t.test('Should filter out null, undefined, and empty values', async (t) => {
    const result = buildUrl('/test/endpoint', {
      foo: 'bar',
      baz: null,
      qux: undefined,
      quux: '',
    });
    t.equal(result, '/test/endpoint?foo=bar');
  });

  t.test('Should encode special characters', async (t) => {
    const result = buildUrl('/test/endpoint', {
      foo: 'bar baz',
      special: 'a&b=c',
    });
    t.equal(result, '/test/endpoint?foo=bar%20baz&special=a%26b%3Dc');
  });

  t.test(
    'Should append with & when endpoint already has query params',
    async (t) => {
      const result = buildUrl('/test/endpoint?existing=param', { foo: 'bar' });
      t.equal(result, '/test/endpoint?existing=param&foo=bar');
    },
  );

  t.end();
});

t.test('buildHeaders', (t) => {
  t.test('Should build headers with API key', async (t) => {
    const result = buildHeaders('test-api-key');
    t.same(result, {
      'content-type': 'application/json',
      'x-mxm-token-apikey': 'test-api-key',
    });
  });

  t.end();
});

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
