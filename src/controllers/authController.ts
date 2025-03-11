import { RequestHandler } from 'express';
import * as v from 'valibot';
import {googleCallbackSchema} from "@schemas/auth/google";
import {registerSchema} from "@schemas/auth/register";
import {User} from "@entity/User";
import createError from "http-errors";
import {hideField, runWithManager} from "@utils/database";
import {Credential, CREDENTIAL_TYPE} from "@entity/Credential";
import * as crypto from 'crypto';

export const googleAuth: RequestHandler  = (req, res) => {
  const query = v.parse(googleCallbackSchema, req.query);
}

export const register: RequestHandler = async (req, res) => {
  const query = v.parse(registerSchema, req.body);

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

  res.end(user);
}
