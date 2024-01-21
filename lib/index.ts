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
import logger from '@/utils/logger'

import routes from '@/routes'
import index from '@/v3/index'
import { config } from '@/config'

process.on('uncaughtException', (e) => {
    logger.error('uncaughtException: ' + e);
});

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

app.get('/', index)

console.log(app)

const port = config.connect.port

logger.info(`🎉 RSSHub is running on port ${port}! Cheers!`)
logger.info('💖 Can you help keep this open source project alive? Please sponsor 👉 https://docs.rsshub.app/support');

serve({
  fetch: app.fetch,
  port
})
