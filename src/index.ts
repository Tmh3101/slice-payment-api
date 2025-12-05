import 'dotenv/config'
import { serve } from '@hono/node-server'
import { logger } from '@/utils/logger'
import { createApp } from '@/app'

const app = createApp()

const port = Number(process.env.PORT ?? 3000)
serve({ fetch: app.fetch, port }, (info) => {
  logger.info(`Server running on http://localhost:${info.port}`)
})