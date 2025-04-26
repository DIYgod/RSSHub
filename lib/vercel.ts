import { handle } from 'hono/vercel';
import app from '@/app';
import logger from '@/utils/logger';
import { setConfig } from '@/config';

setConfig({
    NO_LOGFILES: true,
});

logger.info(`🎉 RSSHub is running! Cheers!`);

export const runtime = 'nodejs';

export const GET = handle(app);
export const POST = handle(app);
