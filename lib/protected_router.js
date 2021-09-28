import Router from '@koa/router';
const router = new Router();
import auth from 'koa-basic-auth';
import { get as getConfig } from '@/config/index.js';
const config = getConfig();

router.use('/(.*)', auth(config.authentication));

// RSSHub
router.get('/rsshub/routes', require('./routes/rsshub/routes'));

export default router;
