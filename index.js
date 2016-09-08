import Promise from 'bluebird';
import mongoose from 'mongoose';
import app from './config/express';
import config from './config/env';

// promisify mongoose
Promise.promisifyAll(mongoose);

// connect to mongo db
mongoose.connect(config.db, { server: { socketOptions: { keepAlive: 1 } } });
mongoose.connection.on('error', () => {
  throw new Error(`unable to connect to database: ${config.db}`);
});

const debug = require('debug')('bachelorarbeit-node-server:index');
console.log(config)
// listen on port config.port
app.listen(config.port, () => {
  debug(`server started on port ${config.port} (${config.env})`);
});

export default app;
