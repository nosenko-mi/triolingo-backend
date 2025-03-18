import express from 'express';
import createError from 'http-errors';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import helmet from 'helmet';
import * as crypto from "node:crypto";

import indexRouter from '@routes/v1/index';
import authRouter from '@routes/v1/auth';
import oauthRouter from '@routes/v1/oauth';
import errorHandler from '@middlewares/errorHandler';

const app = express();

app.use(helmet()); // https://expressjs.com/en/advanced/best-practice-security.html#use-helmet
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use((req, res, next) => {
  if (req.headers.authorization) {
    let tokenParts = req.headers.authorization
      .split(' ')[1]
      .split('.');

    let signature = crypto
      .createHmac('SHA256', String(process.env.JWT_SECRET))
      .update(`${tokenParts[0]}.${tokenParts[1]}`)
      .digest('base64');

    if (signature === tokenParts[2]) {
      const { tokenCreatedAt, user } = JSON.parse(
        Buffer.from(
          tokenParts[1],
          'base64'
        ).toString('utf8')
      );

      (req as any).user = user;
    }

    next();
  }

  next();
});

const v1 = express.Router();
v1.use('/', indexRouter);
v1.use('/auth', authRouter);
v1.use('/oauth', oauthRouter);

app.use('/v1', v1);

/*
catch 404 and forward to error handler
1️⃣ The user sends a request.
2️⃣ Express checks if there is a route for this request.
3️⃣ ❌ If there is no route, the request reaches app.use((req, res, next) => next(createError.NotFound()));).
4️⃣ Next(createError.NotFound()); is called, passing a 404 error.
5️⃣ Express looks for middleware with 4 arguments (err, req, res, next) and passes the error there.
6️⃣ The global error handler sends a JSON response with a 404 code.
*/
app.use((req, res, next) => {
  next(createError.NotFound());
});

app.use(errorHandler);

export default app;
