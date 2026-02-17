import cluster from 'node:cluster';
import os from 'node:os';
import process from 'node:process';

import { serve } from '@hono/node-server';

import app from '@/app';
import { config } from '@/config';
import { getLocalhostAddress } from '@/utils/common-utils';
import logger from '@/utils/logger';

const port = config.connect.port;
const hostIPList = getLocalhostAddress();

let server;
if (config.enableCluster) {
    if (cluster.isPrimary) {
        logger.info(`🎉 RSSHub is running on port ${port}! Cheers!`);
        logger.info(`🔗 Local: 👉 http://localhost:${port}`);
        if (config.listenInaddrAny) {
            for (const ip of hostIPList) {
                logger.info(`🔗 Network: 👉 http://${ip}:${port}`);
            }
        }

        logger.info(`Primary ${process.pid} is running`);

        const numCPUs = os.availableParallelism();

        for (let i = 0; i < numCPUs; i++) {
            cluster.fork();
        }
    } else {
        logger.info(`Worker ${process.pid} is running`);
        serve({
            fetch: app.fetch,
            hostname: config.listenInaddrAny ? '::' : '127.0.0.1',
            port,
            serverOptions: {
                maxHeaderSize: 1024 * 32,
            },
        });
    }
} else {
    logger.info(`🎉 RSSHub is running on port ${port}! Cheers!`);
    logger.info(`🔗 Local: 👉 http://localhost:${port}`);
    if (config.listenInaddrAny) {
        for (const ip of hostIPList) {
            logger.info(`🔗 Network: 👉 http://${ip}:${port}`);
        }
    }

    server = serve({
        fetch: app.fetch,
        hostname: config.listenInaddrAny ? '::' : '127.0.0.1',
        port,
        serverOptions: {
            maxHeaderSize: 1024 * 32,
        },
    });
}

export default server;
