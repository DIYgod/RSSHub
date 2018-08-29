const Router = require('koa-router');
const router = new Router();
const auth = require('koa-basic-auth');

router.use('/(.*)', auth({ name: process.env.HTTP_BASIC_AUTH_NAME || 'usernam3', pass: process.env.HTTP_BASIC_AUTH_PASS || 'passw0rd' }));

// RSSHub
router.get('/rsshub/rss', require('./routes/rsshub/rss'));

module.exports = router;
