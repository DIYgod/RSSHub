import app from '@/app';
import { handle } from 'hono/vercel';

app.basePath('/api');

export const GET = handle(app);
