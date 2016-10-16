import winston from 'winston';

// http logger
const logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({
      json: true,
      colorize: true
    })
  ]
});

export default logger;
