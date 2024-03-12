import { setConfig } from '@/config';
import { handle } from 'hono/vercel';
import app from '@/app';
import logger from '@/utils/logger';

setConfig({
    NO_LOGFILES: true,
});

logger.info(`🎉 RSSHub is running! Cheers!`);
logger.info('💖 Can you help keep this open source project alive? Please sponsor 👉 https://docs.rsshub.app/support');

export default handle(app);
