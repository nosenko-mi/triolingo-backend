import {RequestHandler} from "express";
import * as v from "valibot";
import {googleCallbackSchema} from "@schemas/auth/google";
import {FetchError, ofetch} from "ofetch";
import {User} from "@entity/User";
import {runWithManager} from "@utils/database";
import {Credential, CREDENTIAL_TYPE} from "@entity/Credential";
import {authUser} from "@utils/auth";

interface GoogleResponse {
  issued_to: string;
  audience: string;
  user_id: string;
  scope: string;
  expires_in: number;
  email: string;
  verified_email: boolean;
  access_type: string;
}

export const googleAuth: RequestHandler = async (req, res) => {
  const parse = v.safeParse(googleCallbackSchema, req.body);
  if (!parse.success) {
    res.status(401).json(parse.issues.map((el) => el.message).join(', '))

    return;
  }

  const query = parse.output;

  try {
    const googleRes: GoogleResponse = await ofetch('https://www.googleapis.com/oauth2/v1/tokeninfo', {
      method: 'GET',
      params: {
        access_token: query.accessToken,
      }
    })

    const user = await runWithManager(async (manager) => {
      const email = googleRes.email;

      let user = await manager.findOneBy<User>(User, { email });
      if (!user) {
        user = new User()
        user.email = email;

        await manager.save(user);
      }

      const credential = await manager.findOne<Credential>(Credential, { where: { type: CREDENTIAL_TYPE.CREDENTIAL_OAUTH_GOOGLE, data: googleRes.user_id } }) ?? new Credential()
      if (!credential.id) {
        credential.type = CREDENTIAL_TYPE.CREDENTIAL_OAUTH_GOOGLE;
        credential.data = googleRes.user_id;
        credential.user = user;

        await manager.save(credential);
      }

      return user;
    })

    res.status(200).json(await authUser(user));
  } catch (err: unknown) {
    if (err instanceof FetchError) {
      res.status(err.statusCode ?? 401).end(err.statusMessage ?? 'Unknown error');
    } else {
      // @ts-ignore
      res.status(401).end(err.message ?? 'Unknown error');
    }
  }
}
