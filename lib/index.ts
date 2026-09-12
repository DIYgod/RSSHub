import cluster from 'node:cluster';
import fs from 'node:fs';
import os from 'node:os';
import process from 'node:process';

import { createAdaptorServer, serve } from '@hono/node-server';

import app from '@/app';
import { config } from '@/config';
import { getLocalhostAddress } from '@/utils/common-utils';
import logger from '@/utils/logger';

const port = config.connect.port;
const socketPath = config.connect.socket;
const hostIPList = getLocalhostAddress();

const serverOptions = {
    fetch: app.fetch,
    hostname: config.listenInaddrAny ? (config.disableIPv6 ? '0.0.0.0' : '::') : '127.0.0.1',
    serverOptions: {
        maxHeaderSize: 1024 * 32,
    },
};

const logListening = () => {
    if (socketPath) {
        logger.info(`🎉 RSSHub is running on unix socket ${socketPath}! Cheers!`);
        return;
    }
    logger.info(`🎉 RSSHub is running on port ${port}! Cheers!`);
    logger.info(`🔗 Local: 👉 http://localhost:${port}`);
    if (config.listenInaddrAny) {
        for (const ip of hostIPList) {
            logger.info(`🔗 Network: 👉 http://${ip}:${port}`);
        }
    }
};

// A socket file left behind by an unclean shutdown makes listen() fail with EADDRINUSE.
// Only the process that binds the socket may remove it: a cluster worker must not touch
// the file because the primary already holds the listening handle.
const removeStaleSocket = () => {
    if (socketPath) {
        fs.rmSync(socketPath, { force: true });
    }
};

const listen = () => {
    if (socketPath) {
        const socketServer = createAdaptorServer(serverOptions);
        socketServer.listen(socketPath);
        return socketServer;
    }
    return serve({ ...serverOptions, port });
};

let server;
if (config.enableCluster) {
    if (cluster.isPrimary) {
        logListening();
        logger.info(`Primary ${process.pid} is running`);
        removeStaleSocket();

        const numCPUs = os.availableParallelism();

        for (let i = 0; i < numCPUs; i++) {
            cluster.fork();
        }
    } else {
        logger.info(`Worker ${process.pid} is running`);
        listen();
    }
} else {
    logListening();
    removeStaleSocket();
    server = listen();
}

export default server;
