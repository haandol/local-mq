import * as winston from 'winston';

const level: string = process.env.LOG_LEVEL || 'debug';

const formatter = (info: any) => {
  return `${new Date().toISOString()} \
[${info.level.toUpperCase()}] - ${info.message}`
};

export const logger = winston.createLogger({
  level: level,
  format: winston.format.json(),
  transports: [
    new winston.transports.Console({ 
      level,
      format: winston.format.printf(formatter)
     }),
  ]
});