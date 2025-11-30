import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger as honoLogger } from 'hono/logger'
import { prettyJSON } from 'hono/pretty-json'
import { logger } from '@/utils/logger'

const app = new Hono()

app.use(cors())
app.use(honoLogger())
app.use(prettyJSON())

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
  logger.info(`Server running on http://localhost:${info.port}`)
})
