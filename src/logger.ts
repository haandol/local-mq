import * as winston from 'winston';

const level: string = process.env.LOG_LEVEL || 'debug';

export const logger = winston.createLogger({
  level: level,
  format: winston.format.json(),
  transports: [
    new winston.transports.Console({ level }),
  ]
});