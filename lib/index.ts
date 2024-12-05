import { serve } from '@hono/node-server';
import logger from '@/utils/logger';
import { getLocalhostAddress } from '@/utils/common-utils';
import { config } from '@/config';
import app from '@/app';

const port = config.connect.port;
const hostIPList = getLocalhostAddress();

logger.info(`🎉 RSSHub is running on port ${port}! Cheers!`);
logger.info('💖 Can you help keep this open source project alive? Please sponsor 👉 https://docs.rsshub.app/sponsor');
logger.info(`🔗 Local: 👉 http://localhost:${port}`);
if (config.listenInaddrAny) {
    for (const ip of hostIPList) {
        logger.info(`🔗 Network: 👉 http://${ip}:${port}`);
    }
}

const server = serve({
    fetch: app.fetch,
    hostname: config.listenInaddrAny ? '::' : '127.0.0.1',
    port,
    serverOptions: {
        maxHeaderSize: 1024 * 32,
    },
});

export default server;
