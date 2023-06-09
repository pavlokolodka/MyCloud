import * as Sentry from '@sentry/node';

export { Sentry };

export const sentryOptions = {
  dsn: process.env.SENTRY_URL as string,
  tracesSampleRate: 1.0,
  integrations: [new Sentry.Integrations.Http({ tracing: true })],
};
