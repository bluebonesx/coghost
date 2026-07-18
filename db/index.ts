import { SQL } from 'bun';
import { Kysely } from 'kysely';
import { PostgresJSDialect } from 'kysely-postgres-js';
import type { DB } from './schema';

const url = process.env['DATABASE_URL'];
if (!url) throw Error('DATABASE_URL not found');
export const db = new Kysely<DB>({
  dialect: new PostgresJSDialect({
    postgres: new SQL(url),
  }),
});
