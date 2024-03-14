import type { Handler } from 'hono';
import { namespaces } from '@/registry';

const handler: Handler = (ctx) => ctx.json(namespaces);

export default handler;
