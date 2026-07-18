import Elysia from 'elysia';
import { db } from '../db';
import * as auth from './auth';
import * as logger from './logger';

const app = new Elysia({ prefix: 'api' })
  .use(logger.service)
  .use(auth.service)
  .use(auth.router)
  .onStop(() => db.destroy())
  .listen({ hostname: '127.0.0.1', port: process.env['PORT'] ?? 3000 }, (svr) =>
    console.log(`listen on: ${svr.url}`),
  );
export type API = typeof app;
