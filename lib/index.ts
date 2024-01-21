import { serve } from '@hono/node-server'
import { Handler, Hono } from 'hono'

import cache from '@/middleware/cache'
import template from '@/middleware/template'
import onerror from '@/middleware/onerror'
import accessControl from '@/middleware/access-control'
import debug from '@/middleware/debug'
import header from '@/middleware/header'
import antiHotlink from '@/middleware/anti-hotlink'
import parameter from '@/middleware/parameter'

import routes from '@/routes'
import { config } from '@/config'

const app = new Hono()

app.use('*', onerror);
app.use('*', accessControl);
app.use('*', debug);
app.use('*', header);
app.use('*', template);
app.use('*', antiHotlink);
app.use('*', parameter);
app.use('*', cache);

for (const name in routes) {
  const subApp = app.basePath(`/${name}`)
  routes[name]({
    get: (path, handler) => {
      const wrapedHandler: Handler = async (ctx, ...args) => {
        if (!ctx.get('data')) {
          await handler(ctx, ...args)
        }
      }
      subApp.get(path, wrapedHandler)
    },
  })
}

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

const port = config.connect.port
console.log(`Server is running on port ${port}`)

serve({
  fetch: app.fetch,
  port
})
