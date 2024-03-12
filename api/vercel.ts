require('module-alias/register');

import { setConfig } from '../lib/config';
import { handle } from 'hono/vercel';
import app from '../lib/app';
import logger from '../lib/utils/logger';

setConfig({
    NO_LOGFILES: true,
});

logger.info(`🎉 RSSHub is running! Cheers!`);
logger.info('💖 Can you help keep this open source project alive? Please sponsor 👉 https://docs.rsshub.app/support');

export default handle(app);
