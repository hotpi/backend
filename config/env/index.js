import path from 'path';

const env = process.env.NODE_ENV || 'development';
const config = require(`./${env}`).default;

const defaults = {
  root: path.join(__dirname, '/..')
};

export default {
  ...defaults,
  ...config
};
