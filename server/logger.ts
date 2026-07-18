import Elysia from 'elysia';
import pino from 'pino';

await Bun.$`mkdir -p ./logs`;
const logger = pino({
  transport: {
    targets: [
      { target: 'pino-pretty', options: { singleLine: true } },
      {
        target: 'pino/file',
        level: 'error',
        options: { destination: './logs/error.log' },
      },
      {
        target: 'pino/file',
        level: 'info',
        options: { destination: './logs/access.log' },
      },
    ],
  },
});
export const service = new Elysia({ name: 'logger' })
  .derive(({ request }) => ({
    st: performance.now(),
    log: logger.child(
      {
        req_id: crypto.randomUUID(),
        method: request.method,
        url: request.url,
      },
      { msgPrefix: '[API] ' },
    ),
  }))
  .onError((ctx) => {
    (ctx.log ?? logger).error({ err: ctx.error }, 'req err');
    return { code: 500, msg: '服务器错误' };
  })
  .onAfterResponse(({ log, st, set }) => {
    log.info(
      {
        status: set.status,
        duration: performance.now() - st,
      },
      'req end',
    );
  })
  .as('global');
