import Transport, { TransportStreamOptions } from 'winston-transport';
import type { LogEntry } from 'winston';
import { Http } from '@sentry/node/types/integrations';
import { Sentry } from '../../sentry';

interface SentryTransportOptions extends TransportStreamOptions {
  sentry: {
    dsn: string;
    tracesSampleRate: number;
    integrations: Http[];
  };
}

export class SentryTransport extends Transport {
  constructor(opts: SentryTransportOptions) {
    super(opts);

    Sentry.init(opts.sentry);
  }

  log(info: LogEntry, callback: any) {
    setImmediate(() => {
      this.emit('logged', info);
    });

    if (info.level === 'error' || info.level === 'warn') {
      Sentry.captureException(info.error);
    }

    callback();
  }
}
