import crypto from 'crypto';
import { Elysia, t } from 'elysia';
import { db } from '../db';
import * as logger from './logger';
import { omit } from './util';

const SESSION_EXPIRE = 30 * 24 * 60 * 6e4;
const EMAIL_EXPIRE = 5 * 6e4;

const create_token = () => crypto.randomBytes(32).toString('hex');
const hash = (token: string) =>
  crypto.createHash('sha256').update(token).digest('hex');
const create_session = async (trx: typeof db, user: string) => {
  const token = create_token();
  await trx
    .insertInto('auth_session')
    .values({
      id: hash(token),
      user,
      expires_at: new Date(Date.now() + SESSION_EXPIRE),
      last_used_at: new Date(),
    })
    .execute();
  return {
    value: token,
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: SESSION_EXPIRE * 1e-3,
  } as const;
};

export const service = new Elysia({ name: 'auth' }).macro('auth', {
  cookie: t.Cookie({ session: t.String() }),
  async resolve({ cookie, status }) {
    const token = cookie.session.value;
    if (!token) return status('Unauthorized', '认证信息缺失');

    // verify session
    const session = await db
      .updateTable('auth_session')
      .set({
        expires_at: new Date(Date.now() + SESSION_EXPIRE), // NOTE: update per time
        last_used_at: new Date(),
      })
      .where('id', '=', hash(token))
      .where('expires_at', '>', new Date())
      .returning('user')
      .executeTakeFirst();
    if (!session) return status('Unauthorized', '认证失败');
    return session;
  },
});
export const router = new Elysia({ prefix: 'auth' }).use(logger.service).post(
  '',
  async ({ log, body, cookie }) => {
    const user = await db
      .selectFrom('user')
      .selectAll()
      .where('email', '=', body.email)
      .executeTakeFirst();

    // signin
    if (user) {
      if (!(await Bun.password.verify(body.pwd, user.pwd))) {
        return { code: 1, msg: '密码错误' };
      }
      cookie['session']!.set(await create_session(db, user.id));
      return {
        code: 0,
        msg: '登录成功',
        data: omit(user, ['id', 'pwd', 'create_at']),
      };
    }

    // signup
    // const token = create_token();
    // await db
    //   .insertInto('email_verify')
    //   .values({
    //     id: hash(token),
    //     email: body.email,
    //     pwd: await Bun.password.hash(body.pwd),
    //     expires_at: new Date(Date.now() + EMAIL_EXPIRE),
    //   })
    //   .execute();
    //
    // const verify_url =
    //   process.env['HOST'] + `/api/auth/verify?token=${token}`;
    // const email = await brevo.transactionalEmails.sendTransacEmail({
    //   subject: '邮箱验证',
    //   htmlContent: `点击 <a href="${verify_url}">${verify_url}</a> 进行验证，有效期 ${EMAIL_EXPIRE / 6e4} 分钟`,
    //   sender: { email: 'no-reply@supportsld.com', name: 'SupportSLD' },
    //   to: [{ email: body.email }],
    // });
    // log.info(email, 'email send');
    // return { code: 0, msg: '已发送验证邮件' };
    return {
      code: 0,
      msg: '注册成功',
      data: await db
        .insertInto('user')
        .values({
          email: body.email,
          pwd: await Bun.password.hash(body.pwd),
          name: '',
          role: 'participant',
          gender: 'unknown',
          birthday: new Date(),
        })
        .executeTakeFirstOrThrow(),
    };
  },
  {
    body: t.Object(
      {
        email: t.String({ format: 'email' }),
        pwd: t.String(),
      },
      { additionalProperties: false },
    ),
  },
);
// .get(
//   'verify',
//   async ({ query, cookie, redirect }) => {
//     const trx_result = await db.transaction().execute(async (trx) => {
//       // verify token
//       const email_verify = await trx
//         .deleteFrom('email_verify')
//         .where('id', '=', hash(query.token))
//         .returningAll()
//         .executeTakeFirst();
//       if (!email_verify) {
//         return '验证链接无效';
//       }
//       if (email_verify.expires_at < new Date()) {
//         return '验证链接已过期';
//       }
//
//       // create user
//       const user = await trx
//         .insertInto('user')
//         .values({
//           email: email_verify.email,
//           pwd: email_verify.pwd,
//           age: 0,
//           gender: GENDER.UNKNOWN.code,
//           edu: EDU.UNKNOWN.code,
//         })
//         .returning('id')
//         .executeTakeFirstOrThrow();
//
//       return await create_session(trx, user.id);
//     });
//
//     if (typeof trx_result === 'string') return { code: 1, msg: trx_result };
//     cookie['session']!.set(trx_result);
//     return redirect('/');
//   },
//   {
//     query: t.Object({
//       token: t.String(),
//     }),
//   },
// );
