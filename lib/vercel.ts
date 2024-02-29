import { handle } from 'hono/vercel';
import app from '@/app';
import logger from '@/utils/logger';

export const runtime = 'edge';

logger.info(`🎉 RSSHub is running! Cheers!`);
logger.info('💖 Can you help keep this open source project alive? Please sponsor 👉 https://docs.rsshub.app/support');

export const GET = handle(app);
export const POST = handle(app);
