import { FileMigrationProvider, Migrator } from 'kysely/migration';
import fs from 'node:fs/promises';
import path from 'node:path';
import { db } from '.';

/**@see https://www.kysely.dev/docs/migrations */
const migrator = new Migrator({
  db,
  provider: new FileMigrationProvider({
    fs,
    path,
    migrationFolder: path.join(import.meta.dirname, './migrations'),
  }),
});

const cmdMap = {
  up: 'migrateUp',
  down: 'migrateDown',
  latest: 'migrateToLatest',
} satisfies Record<string, keyof Migrator>;
const arg = process.argv[2] as keyof typeof cmdMap;
if (!arg || !(arg in cmdMap)) {
  console.log(
    `Only support: ${Object.keys(cmdMap).join(', ')}, but got: ${arg}`,
  );
  process.exit(1);
}
const op_type = cmdMap[arg];

const { error, results } = await migrator[op_type]();
if (results) {
  for (const e of results) {
    console.log(e.migrationName, e.direction, e.status);
  }
}
if (error) {
  console.error('Failed to migrate', error);
  process.exit(1);
}

await db.destroy();
