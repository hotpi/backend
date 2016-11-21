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

export const otLogger = new (winston.Logger)({
  transports: [
    new (winston.transports.File)({
      name: 'info-file',
      filename: 'trace.log',
      level: 'info'
    })
  ]
})

export const debugLogger = new (winston.Logger)({
  transports: [
    new (winston.transports.File)({
      name: 'info-file',
      filename: 'debug.log',
      level: 'debug'
    })
  ]
})

export default logger;

