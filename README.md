<div align="center">
  <p>
    <img src="./assets/package-logo.png" height=304 alt="Logo" />
  </p>
  <p>
    HTTP client SDK showcase using <a href="https://github.com/nodejs/undici" target="blank">Undici</a>,<br>
    <a href="https://github.com/colinhacks/zod" target="blank">Zod</a> and <a href="https://github.com/pinojs/pino" target="blank">Pino</a> logger.
  </p>
  <!--<p>
    <a href="https://www.npmjs.com/@andreafspeziale/nestjs-log" target="_blank"><img src="https://img.shields.io/npm/v/@andreafspeziale/nestjs-log" alt="NPM Version" /></a>
    <a href="https://www.npmjs.com/@andreafspeziale/nestjs-log" target="_blank"><img src="https://img.shields.io/npm/l/@andreafspeziale/nestjs-log.svg" alt="Package License" /></a>
    <a href="https://github.com/andreafspeziale/nestjs-log/actions" target="_blank"><img src="https://img.shields.io/github/actions/workflow/status/andreafspeziale/nestjs-log/test.yml" alt="Test Status"/></a>
  <p>-->
</div>

## Installation

### npm

```sh
npm install @andreafspeziale/mxm-api
```

### yarn

```sh
yarn add @andreafspeziale/mxm-api
```

### pnpm

```sh
pnpm add @andreafspeziale/mxm-api
```

## How to use?

> [!NOTE]
> To effectively interact with the Musixmatch API you need a valid API key.

The SDK implements most of the [Musixmatch API endpoints](https://docs.musixmatch.com/lyrics-api/introduction), providing a strongly typed and easy-to-use interface for developers. It handles authentication, request construction, and response parsing, allowing you to focus on building your application.

### Zero-config

```ts
import { MxmAPI } from '@andreafspeziale/mxm-api';

const mxmAPI = new MxmAPI();

const track = await mxmAPI.trackGet({
  track_isrc: 'USUM72005901',
  apiKey: 'your-api-key',
});
```

### With API key configuration

```ts
import { MxmAPI } from '@andreafspeziale/mxm-api';

const mxmAPI = new MxmAPI({
  config: {
    apiKey: 'your-api-key',
  },
});

const track = await mxmAPI.trackGet({
  track_isrc: 'USUM72005901',
});
```

### With API key & Logging configuration
> A Pino basic logger instance is created internally when `enableLog` is set to `true`.

```ts
import { MxmAPI } from '@andreafspeziale/mxm-api';

const mxmAPI = new MxmAPI({
  config: {
    apiKey: 'your-api-key',
    enableLog: true,
    defaultLoggerConfig: {
      formatters: {
        level: (label) => {
          return { level: label };
        },
      },
    },
  },
});

const track = await mxmAPI.trackGet({
  track_isrc: 'USUM72005901',
});
```

### With API key & Pino instance plus Logging configuration
> A Pino logger instance is provided and logging can be enabled/disabled via configuration.

```ts
import { pino } from 'pino';
import { MxmAPI } from '@andreafspeziale/mxm-api';

const logger = pino({
  formatters: {
    level: (label) => {
      return { level: label };
    },
  },
});

const mxmAPI = new MxmAPI({
  logger,
  config: {
    apiKey: 'your-api-key',
    enableLog: true,
  },
});

const track = await mxmAPI.trackGet({
  track_isrc: 'USUM72005901',
});
```

## Available methods

- `matcherLyricsGet` ([matcher.lyrics.get](https://docs.musixmatch.com/lyrics-api/matcher/matcher-lyrics-get))
- `matcherSubtitleGet` ([matcher.subtitle.get](https://docs.musixmatch.com/lyrics-api/matcher/matcher-subtitle-get))
- `matcherTrackGet` ([matcher.track.get](https://docs.musixmatch.com/lyrics-api/matcher/matcher-track-get))
- `trackGet` ([track.get](https://docs.musixmatch.com/lyrics-api/track/track-get))

## Test

- `pnpm tap` or `npm run test`

## Stay in touch

- Author - [Andrea Francesco Speziale](https://x.com/andreafspeziale)

## License

mxm-api [MIT licensed](LICENSE).
