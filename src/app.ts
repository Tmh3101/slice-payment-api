import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger as honoLogger } from 'hono/logger'
import { prettyJSON } from 'hono/pretty-json'
import { globalErrorHandler, notFoundHandler } from './middlewares/error-handler'
import orderRouter from './routes/order.route'
import dnpayPaymentRoute from './routes/dnpay-payment.route'

export const createApp = () => {
  const app = new Hono()

  app.use(cors())
  app.use(honoLogger())
  app.use(prettyJSON())

  app.get('/', (c) => c.text('Hello Slice Payment API!'))

  app.route('/api/orders', orderRouter)
  app.route('/api/dnpay-payment', dnpayPaymentRoute)

  app.notFound(notFoundHandler)
  app.onError(globalErrorHandler)

  return app
}
