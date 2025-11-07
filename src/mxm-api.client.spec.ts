import { type Logger, pino } from 'pino';
import t from 'tap';
import { MxmAPI } from './mxm-api.client.js';

t.test('MxmAPI', (t) => {
  t.test('Should instantiate with minimal configuration', async (t) => {
    const client = new MxmAPI({});

    t.ok(client instanceof MxmAPI);
    t.ok(client['client']);
    t.notOk(client['config']);
    t.notOk(client['logger']);
  });

  t.test('Should instantiate with apiKey configuration', async (t) => {
    const apiKey = 'test-api-key';
    const client = new MxmAPI({
      config: {
        apiKey,
      },
    });

    t.ok(client instanceof MxmAPI);
    t.ok(client['config']);
    t.equal(client['config']?.apiKey, apiKey);
    t.notOk(client['logger']);
  });

  t.test(
    'Should instantiate with logging enabled and default logger config',
    async (t) => {
      const client = new MxmAPI({
        config: {
          enableLog: true,
        },
      });

      t.ok(client instanceof MxmAPI);
      t.ok(client['config']);
      t.ok(client['logger']);
      t.equal(client['logger']?.constructor.name, 'Pino');
    },
  );

  t.test(
    'Should instantiate with logging enabled and custom logger config',
    async (t) => {
      const client = new MxmAPI({
        config: {
          enableLog: true,
          defaultLoggerConfig: {
            level: 'debug',
          },
        },
      });

      t.ok(client instanceof MxmAPI);
      t.ok(client['config']);
      t.ok(client['logger']);
      t.equal(client['logger']?.constructor.name, 'Pino');
    },
  );

  t.test('Should instantiate with external logger', async (t) => {
    const externalLogger = pino({ level: 'info' });
    const client = new MxmAPI({
      config: {
        enableLog: true,
      },
      logger: externalLogger,
    });

    t.ok(client instanceof MxmAPI);
    t.ok(client['config']);
    t.ok(client['logger']);
    t.equal(client['logger']?.constructor.name, 'Pino');
  });

  t.test(
    'Should instantiate with external logger that has child method',
    async (t) => {
      const externalLogger = pino({ level: 'info' });
      let capturedArgs = null;
      const originalChild = externalLogger.child.bind(externalLogger);
      externalLogger.child = (bindings) => {
        capturedArgs = bindings;
        return originalChild(bindings);
      };

      const client = new MxmAPI({
        config: {
          enableLog: true,
        },
        logger: externalLogger,
      });

      t.ok(client instanceof MxmAPI);
      t.ok(client['logger']);
      t.ok(capturedArgs);
      t.same(capturedArgs, { context: 'MxmAPI' });
    },
  );

  t.test(
    'Should instantiate with external logger without child method',
    async (t) => {
      const externalLogger = {
        info: () => {},
        error: () => {},
        warn: () => {},
        debug: () => {},
      } as unknown as Logger;

      const client = new MxmAPI({
        config: {
          enableLog: true,
        },
        logger: externalLogger,
      });

      t.ok(client instanceof MxmAPI);
      t.ok(client['logger']);
      t.equal(client['logger'], externalLogger);
    },
  );

  t.test('Should not create logger when enableLog is false', async (t) => {
    const externalLogger = pino({ level: 'info' });

    const client = new MxmAPI({
      config: {
        enableLog: false,
      },
      logger: externalLogger,
    });

    t.ok(client instanceof MxmAPI);
    t.ok(client['config']);
    t.notOk(client['logger']);
  });

  t.test('Should not create logger when config is not provided', async (t) => {
    const externalLogger = pino({ level: 'info' });

    const client = new MxmAPI({
      logger: externalLogger,
    });

    t.ok(client instanceof MxmAPI);
    t.notOk(client['config']);
    t.notOk(client['logger']);
  });

  t.test('Should instantiate with full configuration', async (t) => {
    const apiKey = 'test-api-key';
    const externalLogger = pino({ level: 'debug' });

    const client = new MxmAPI({
      config: {
        apiKey,
        enableLog: true,
        defaultLoggerConfig: {
          level: 'trace',
        },
      },
      logger: externalLogger,
    });

    t.ok(client instanceof MxmAPI);
    t.ok(client['config']);
    t.equal(client['config']?.apiKey, apiKey);
    t.ok(client['logger']);
  });

  t.end();
});
