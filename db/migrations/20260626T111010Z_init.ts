import { sql, type Kysely } from 'kysely';

export const up = async (db: Kysely<any>) => {
  await db.schema
    .createType('user_role')
    .asEnum(['participant', 'experimenter', 'admin'])
    .execute();
  await db.schema
    .createType('user_gender')
    .asEnum(['unknown', 'male', 'female'])
    .execute();
  await db.schema
    .createTable('user')
    .addColumn('id', 'uuid', (c) =>
      c.primaryKey().defaultTo(sql`gen_random_uuid()`),
    )
    .addColumn('create_at', 'timestamptz', (c) =>
      c.notNull().defaultTo(sql`now()`),
    )
    .addColumn('name', 'text', (c) => c.notNull())
    .addColumn('pwd', 'text', (c) => c.notNull())
    .addColumn('role', sql`user_role`, (c) => c.notNull())
    .addColumn('gender', sql`user_gender`, (c) => c.notNull())
    .addColumn('birthday', 'date', (c) => c.notNull())
    .addColumn('email', 'text', (c) => c.notNull().unique())
    .addColumn('phone', 'text', (c) => c.unique())
    .execute();

  // auth
  await db.schema
    .createTable('auth_session')
    .addColumn('id', 'text', (col) => col.primaryKey()) // token hash
    .addColumn('create_at', 'timestamptz', (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .addColumn('user', 'uuid', (col) =>
      col.notNull().references('user.id').onDelete('cascade'),
    )
    .addColumn('expires_at', 'timestamptz', (col) => col.notNull())
    .addColumn('last_used_at', 'timestamptz', (col) => col.notNull())
    .execute();
  await db.schema
    .createIndex('auth_session_user_idx')
    .on('auth_session')
    .column('user')
    .execute();

  // task
  await db.schema
    .createType('task_type')
    .asEnum(['online', 'offline'])
    .execute();
  await db.schema
    .createType('task_status')
    .asEnum(['pending', 'publish', 'archived'])
    .execute();
  await db.schema
    .createTable('task')
    .addColumn('id', 'uuid', (c) =>
      c.primaryKey().defaultTo(sql`gen_random_uuid()`),
    )
    .addColumn('create_at', 'timestamptz', (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .addColumn('owner', 'uuid', (c) =>
      c.notNull().references('user.id').onDelete('cascade'),
    )
    .addColumn('name', 'text', (c) => c.notNull())
    .addColumn('desc', 'text', (c) => c.notNull())
    .addColumn('type', sql`task_type`, (c) => c.notNull())
    .addColumn('status', sql`task_status`, (c) =>
      c.notNull().defaultTo(sql`'pending'::task_status`),
    )
    .execute();
  await db.schema
    .createIndex('task_owner_idx')
    .on('task')
    .column('owner')
    .execute();

  await db.schema
    .createTable('task_session')
    .addColumn('id', 'uuid', (c) =>
      c.primaryKey().defaultTo(sql`gen_random_uuid()`),
    )
    .addColumn('task', 'uuid', (c) =>
      c.notNull().references('task.id').onDelete('cascade'),
    )
    .addColumn('start_at', 'timestamptz', (c) => c.notNull())
    .addColumn('end_at', 'timestamptz')
    .execute();
  await db.schema
    .createIndex('task_session_task_idx')
    .on('task_session')
    .column('task')
    .execute();

  await db.schema
    .createTable('task_session_participant_rel')
    .addColumn('session', 'uuid', (c) =>
      c.notNull().references('task_session.id').onDelete('cascade'),
    )
    .addColumn('participant', 'uuid', (c) =>
      c.notNull().references('user.id').onDelete('cascade'),
    )
    .addPrimaryKeyConstraint('task_session_participant_pk', [
      'session',
      'participant',
    ])
    .execute();
  await db.schema
    .createIndex('task_session_rel_session_idx')
    .on('task_session_participant_rel')
    .column('session')
    .execute();
  await db.schema
    .createIndex('task_session_rel_participant_idx')
    .on('task_session_participant_rel')
    .column('participant')
    .execute();

  await db.schema
    .createTable('task_record')
    .addColumn('session', 'uuid', (c) =>
      c.notNull().references('task_session.id').onDelete('cascade'),
    )
    .addColumn('create_at', 'timestamptz', (col) => col.notNull())
    .addColumn('data', 'jsonb', (c) => c.notNull())
    .execute();
  await db.schema
    .createIndex('task_record_session_create_at_idx')
    .on('task_record')
    .columns(['session', 'create_at'])
    .execute();
};
export const down = async (db: Kysely<any>) => {
  await db.schema.dropTable('auth_session').ifExists().execute();

  await db.schema.dropTable('task_record').ifExists().execute();
  await db.schema
    .dropTable('task_session_participant_rel')
    .ifExists()
    .execute();
  await db.schema.dropTable('task_session').ifExists().execute();
  await db.schema.dropTable('task').ifExists().execute();
  await db.schema.dropType(['task_type', 'task_status']).ifExists().execute();

  await db.schema.dropTable('user').ifExists().execute();
  await db.schema.dropType(['user_role', 'user_gender']).ifExists().execute();
};
