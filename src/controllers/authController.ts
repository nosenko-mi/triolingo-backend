import {RequestHandler} from 'express';
import * as v from 'valibot';
import {registerSchema} from "@schemas/auth/register";
import {User} from "@entity/User";
import createError from "http-errors";
import {runWithManager} from "@utils/database";
import {Credential, CREDENTIAL_TYPE} from "@entity/Credential";
import * as crypto from 'crypto';
import {loginSchema} from "@schemas/auth/login";

export const register: RequestHandler = async (req, res) => {
  const parse = v.safeParse(registerSchema, req.body);
  if (!parse.success) {
    res.status(401).json(parse.issues.map((el) => el.message).join(', '))

    return;
  }

  const query = parse.output;

  try {
    const user = await runWithManager(async (manager) => {
      const isUserExist = await manager.existsBy<User>(User, { email: query.email });
      if (isUserExist) {
        throw createError({
          statusCode: 403,
          message: 'User with this email already exists',
        })
      }

      const user = new User()
      user.email = query.email;

      await manager.save(user);

      const credential = new Credential();
      credential.type = CREDENTIAL_TYPE.CREDENTIAL_PASSWORD;
      credential.data = crypto.createHash('sha256').update(query.password).digest('hex');
      credential.user = user;

      await manager.save(credential)

      return user;
    })

    res.status(200).json(await authUser(user));
  } catch (err) {
    res.status(403).json(err)
  }
}

export const login: RequestHandler = async (req, res) => {
  const parse = v.safeParse(loginSchema, req.body);
  if (!parse.success) {
    res.status(401).json(parse.issues.map((el) => el.message).join(', '))

    return;
  }

  const query = parse.output;

  try {
    const user = await runWithManager(async (manager) => {
      const user = await manager.findOneBy<User>(User, { email: query.email });
      if (!user) {
        throw createError({
          statusCode: 403,
          message: 'User with this email does not exist',
        })
      }

      const password = crypto.createHash('sha256').update(query.password).digest('hex');

      const credential = await manager.findOneBy<Credential>(Credential, { type: CREDENTIAL_TYPE.CREDENTIAL_PASSWORD, data: password, user: { id: user.id } });
      if (!credential) {
        throw createError({
          statusCode: 403,
          message: 'User with this email does not exist',
        })
      }

      return user;
    });

    res.status(200).json(await authUser(user));
  } catch (err: unknown) {
    res.status(403).json(err)
  }
}

export const check: RequestHandler = async (req, res) => {
  res.status(200).json((req as any).user);
}

const authUser = async (user: User) => {
  const params = {
    user,
    token: {
      createdAt: new Date(),
    },
  };

  let head = Buffer.from(
    JSON.stringify({ alg: 'HS256', typ: 'jwt' })
  ).toString('base64');
  let body = Buffer.from(
    JSON.stringify(params)
  ).toString('base64');
  let signature = crypto
    .createHmac('SHA256', String(process.env.JWT_SECRET))
    .update(`${head}.${body}`)
    .digest('base64');

  return {
    ...params,
    token: {
      ...params.token,
      value: `${head}.${body}.${signature}`,
    },
  };
}
