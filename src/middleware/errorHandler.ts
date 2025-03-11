import createError from 'http-errors';

// eslint-disable-next-line no-unused-vars
const errorHandler = (err: any, req: any, res: any, next: any) => {
  // eslint-disable-next-line no-console
  console.error(err);

  // if the error is safe to expose to client
  if (err.expose) {
    res.status(err.status || 500).send(err);
  } else {
    res.status(500).send(createError.InternalServerError());
  }
};

export default errorHandler;
