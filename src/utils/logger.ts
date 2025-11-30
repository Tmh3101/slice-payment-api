import pino from 'pino'

const isDev = process.env.NODE_ENV !== 'production'

export const logger = pino({
  level: process.env.LOG_LEVEL || 'debug',
  transport: isDev
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'HH:MM:ss',
          ignore: 'pid,hostname',
        },
      }
    : undefined,
})