const Router = require('koa-router');
const router = new Router();
const auth = require('koa-basic-auth');
const config = require('./config');

router.use('/(.*)', auth(config.authentication));

// RSSHub
router.get('/rsshub/rss', require('./routes/rsshub/rss'));

module.exports = router;
