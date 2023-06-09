import { createLogger, transports, format } from 'winston';
const { timestamp, colorize, printf } = format;
import { sentryOptions } from '../../sentry';
import { SentryTransport } from './sentry-transport';

const customFormat = format.combine(
  timestamp({ format: 'YY-MM-DD HH:mm:ss' }),
  printf(({ message, level, timestamp }) => {
    return `[${level.toUpperCase()}] - ${timestamp} : ${message}`;
  }),
  colorize({ all: true }),
);

const customSentryFormat = format.combine(
  timestamp({ format: 'YY-MM-DD HH:mm:ss' }),
  printf(({ message, level, timestamp }) => {
    return `[${level.toUpperCase()}] - ${timestamp} : ${message}`;
  }),
);

const logger = createLogger({
  transports: [
    new transports.Console({
      format: customFormat,
    }),
    new SentryTransport({
      sentry: sentryOptions,
      format: customSentryFormat,
    }),
  ],
});

export default logger;
