import 'dotenv/config'
import { serve } from '@hono/node-server'
import { logger } from '@/utils/logger.js'
import { createApp } from '@/app.js'

const app = createApp()

const port = Number(process.env.PORT ?? 3000)
serve({ fetch: app.fetch, port }, (info) => {
  logger.info(`Server running on http://localhost:${info.port}`)
})