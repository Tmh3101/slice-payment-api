import 'dotenv/config'
import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger as honoLogger } from 'hono/logger'
import { prettyJSON } from 'hono/pretty-json'
import { logger } from '@/utils/logger'
import { globalErrorHandler, notFoundHandler } from './middlewares/error-handler';
import orderRouter from '@/routes/order.route'

const app = new Hono()

app.use(cors())
app.use(honoLogger())
app.use(prettyJSON())

app.get('/', (c) => c.text('Hello Slice Payment API!'))

app.route('/api/orders', orderRouter)

app.notFound(notFoundHandler);
app.onError(globalErrorHandler);

const port = Number(process.env.PORT ?? 3000);
serve({ fetch: app.fetch, port }, (info) => {
  logger.info(`Server running on http://localhost:${info.port}`)
})
