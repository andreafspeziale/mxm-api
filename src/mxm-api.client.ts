import { type Logger, pino } from 'pino';
import { Client } from 'undici';
import {
  type MatcherLyricsGetPayload,
  type MxmAPIMatcherLyricsGetResponse,
  matcherLyricsGet,
} from './endpoints/matcher.lyrics.get/index.js';
import {
  type MatcherSubtitleGetPayload,
  type MxmAPIMatcherSubtitleGetResponse,
  matcherSubtitleGet,
} from './endpoints/matcher.subtitle.get/index.js';
import {
  type MatcherTrackGetPayload,
  type MxmAPIMatcherTrackGetResponse,
  matcherTrackGet,
} from './endpoints/matcher.track.get/index.js';
import {
  type MxmAPITrackGetResponse,
  type TrackGetGetPayload,
  trackGet,
} from './endpoints/track.get/index.js';
import { MUSIXMATCH_BASE_URL } from './mxm-api.constants.js';
import type {
  EndpointPayload,
  MxmAPIConfig,
  MxmAPIResponse,
} from './mxm-api.interfaces.js';

export class MxmAPI {
  private readonly client: Client;
  private readonly config?: MxmAPIConfig;
  private readonly logger?: Logger;

  constructor({
    config,
    logger,
  }: {
    config?: MxmAPIConfig;
    logger?: Logger;
  }) {
    this.client = new Client(MUSIXMATCH_BASE_URL);

    if (config) {
      this.config = config;

      if (this.config.enableLog) {
        if (logger) {
          this.logger =
            typeof logger.child === 'function'
              ? logger.child({ context: MxmAPI.name })
              : logger;
        } else {
          this.logger = this.config.defaultLoggerConfig
            ? pino(this.config.defaultLoggerConfig).child({
                context: MxmAPI.name,
              })
            : pino().child({ context: MxmAPI.name });
        }
      }
    }
  }

  async matcherLyricsGet(
    payload: EndpointPayload<MatcherLyricsGetPayload>['payload'],
  ): Promise<MxmAPIResponse<MxmAPIMatcherLyricsGetResponse>> {
    const { apiKey, ...rest } = payload;
    return matcherLyricsGet({
      payload: { apiKey: apiKey || this.config?.apiKey, ...rest },
      client: this.client,
      logger: this.logger,
    });
  }

  async matcherSubtitleGet(
    payload: EndpointPayload<MatcherSubtitleGetPayload>['payload'],
  ): Promise<MxmAPIResponse<MxmAPIMatcherSubtitleGetResponse>> {
    const { apiKey, ...rest } = payload;
    return matcherSubtitleGet({
      payload: { apiKey: apiKey || this.config?.apiKey, ...rest },
      client: this.client,
      logger: this.logger,
    });
  }

  async matcherTrackGet(
    payload: EndpointPayload<MatcherTrackGetPayload>['payload'],
  ): Promise<MxmAPIResponse<MxmAPIMatcherTrackGetResponse>> {
    const { apiKey, ...rest } = payload;
    return matcherTrackGet({
      payload: { apiKey: apiKey || this.config?.apiKey, ...rest },
      client: this.client,
      logger: this.logger,
    });
  }

  async trackGet(
    payload: EndpointPayload<TrackGetGetPayload>['payload'],
  ): Promise<MxmAPIResponse<MxmAPITrackGetResponse>> {
    const { apiKey, ...rest } = payload;
    return trackGet({
      payload: { apiKey: apiKey || this.config?.apiKey, ...rest },
      client: this.client,
      logger: this.logger,
    });
  }
}
