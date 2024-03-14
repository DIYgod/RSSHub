import { Hono } from 'hono';
import rules from '@/api/radar/rules';

const app = new Hono();
app.get('/radar/rules.json', rules);

export default app;
