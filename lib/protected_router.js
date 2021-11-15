import Router from '@koa/router';
const router = new Router();
import auth from 'koa-basic-auth';
import { getGlobalConfig } from '@/config/index.js';
const config = getGlobalConfig();

router.use('/(.*)', auth(config.authentication));

// RSSHub
router.get('/rsshub/routes', require('./routes/rsshub/routes'));

export default router;
