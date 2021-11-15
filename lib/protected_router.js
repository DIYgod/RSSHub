import Router from '@koa/router';
import auth from 'koa-basic-auth';
import {config} from './config.js';

const router = new Router();

router.use('/(.*)', auth(config.authentication));

// RSSHub
router.get('/rsshub/routes', (await import('./routes/index.js')).default);

export default router;
