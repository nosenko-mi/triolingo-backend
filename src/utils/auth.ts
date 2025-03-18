import {User} from "@entity/User";
import crypto from "crypto";

export const authUser = async (user: User) => {
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
