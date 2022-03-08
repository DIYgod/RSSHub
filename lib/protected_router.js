const Router = require('@koa/router');
const router = new Router();
const auth = require('koa-basic-auth');
const config = require('./config').value;

router.use('/(.*)', auth(config.authentication));

// RSSHub
router.get('/rsshub/routes/:lang?', require('./v2/rsshub/routes'));

module.exports = router;
