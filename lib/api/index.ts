import { Hono } from 'hono';
import rules from '@/api/radar/rules';
import routes from '@/api/routes';

const app = new Hono();
app.get('/radar/rules', rules);
app.get('/routes', routes);

export default app;
