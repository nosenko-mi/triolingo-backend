#!/usr/bin/env node
/// <reference path="../../@types/global.d.ts" />

require('dotenv').config()

import {AppDataSource} from "../data-source";

import * as http from 'http';
import app from '../app';

(async () => {
  global.db = await AppDataSource.initialize();

  function normalizePort(val: string) {
    const port = parseInt(val, 10);

    if (Number.isNaN(port)) {
      return val;
    }

    if (port >= 0) {
      return port;
    }

    return false;
  }

  const port = normalizePort(process.env.PORT || '3000');
  app.set('port', port);

  const server = http.createServer(app);

  function onError(error: Error & { syscall: string; code: string }) {
    console.error(error); // eslint-disable-line no-console

    if (error.syscall !== 'listen') {
      throw error;
    }

    const bind = typeof port === 'string' ? `Pipe ${port}` : `Port ${port}`;

    switch (error.code) {
      case 'EACCES':
        console.error(`${bind} requires elevated privileges`); // eslint-disable-line no-console
        process.exit(1);

        break;
      case 'EADDRINUSE':
        console.error(`${bind} is already in use`); // eslint-disable-line no-console
        process.exit(1);

        break;
      default:
        throw error;
    }
  }

  function onListening() {
    const addr = server.address();
    const bind = typeof addr === 'string' ? `pipe ${addr}` : `port ${addr!.port}`;

    console.log(`Listening on ${bind}`); // eslint-disable-line no-console
  }

  server.listen(port);
  server.on('error', onError);
  server.on('listening', onListening);
})();
