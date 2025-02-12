// import { serve } from '@hono/node-server';
import logger from '@/utils/logger';
import { getLocalhostAddress } from '@/utils/common-utils';
import { config } from '@/config';
import app from '@/app';
import fs from 'fs';
import https from 'https';
import { IncomingMessage, ServerResponse } from 'http';
import { Readable } from 'stream';

const port = config.connect.port;
const hostIPList = getLocalhostAddress();

const options = {
    key: fs.readFileSync('D:/a2845/Documents/GitHub/ssl/mtheme.top.key'),
    cert: fs.readFileSync('D:/a2845/Documents/GitHub/ssl/mtheme.top_public.crt'),
    ca: fs.readFileSync('D:/a2845/Documents/GitHub/ssl/mtheme.top_chain.crt'),
};

logger.info(`🎉 RSSHub is running on port ${port}! Cheers!`);
logger.info('💖 Can you help keep this open source project alive? Please sponsor 👉 https://docs.rsshub.app/sponsor');
logger.info(`🔗 Local: 👉 https://localhost:${port}`);
if (config.listenInaddrAny) {
    for (const ip of hostIPList) {
        logger.info(`🔗 Network: 👉 https://${ip}:${port}`);
    }
}

const requestListener = async (req: IncomingMessage, res: ServerResponse) => {
    const request = new Request(`https://${req.headers.host}${req.url}`, {
        method: req.method,
        headers: req.headers as HeadersInit,
        body: req.method !== 'GET' && req.method !== 'HEAD' ? (req as unknown as BodyInit) : undefined,
    });

    try {
        const response = await app.fetch(request);
        res.writeHead(response.status, response.statusText, Object.fromEntries(response.headers));
        if (response.body) {
            const reader = response.body.getReader();
            const stream = new Readable({
                read() {
                    reader
                        .read()
                        .then(({ done, value }) => {
                            if (done) {
                                this.push(null);
                            } else {
                                this.push(value);
                            }
                        })
                        .catch((error) => {
                            logger.error('❌ Error reading response body:', error);
                            this.push(null);
                        });
                },
            });
            stream.pipe(res);
        } else {
            res.end();
        }
    } catch (error) {
        logger.error('❌ Error handling request:', error);
        res.writeHead(500);
        res.end('Internal Server Error');
    }
};

const httpsServer = https.createServer(options, requestListener);

httpsServer.listen(port, config.listenInaddrAny ? '::' : '127.0.0.1', () => {
    logger.info('✅ HTTPS server started successfully.');
});

export default httpsServer;
