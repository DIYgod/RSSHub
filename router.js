const Router = require('koa-router');
const router = new Router();

// // bilibili
router.get('/bilibili/user/video/:uid', require('./routes/bilibili/video'));
router.get('/bilibili/user/fav/:uid', require('./routes/bilibili/fav'));
router.get('/bilibili/user/coin/:uid', require('./routes/bilibili/coin'));
router.get('/bilibili/user/dynamic/:uid', require('./routes/bilibili/dynamic'));
router.get('/bilibili/partion/:tid', require('./routes/bilibili/partion'));
router.get('/bilibili/bangumi/:seasonid', require('./routes/bilibili/bangumi'));

// // 微博
router.get('/weibo/user/:uid', require('./routes/weibo/user'));

// // 网易云音乐
router.get('/ncm/playlist/:id', require('./routes/ncm/playlist'));
router.get('/ncm/user/playlist/:uid', require('./routes/ncm/userplaylist'));
router.get('/ncm/artist/:id', require('./routes/ncm/artist'));

// // 掘金
router.get('/juejin/category/:category', require('./routes/juejin/category'));

// // 自如
router.get('/ziroom/room/:city/:iswhole/:room/:keyword', require('./routes/ziroom/room'));

// // 快递
router.get('/express/:company/:number', require('./routes/express/express'));

// // 简书
router.get('/jianshu/home', require('./routes/jianshu/home'));
router.get('/jianshu/trending/weekly', require('./routes/jianshu/weekly'));
router.get('/jianshu/trending/monthly', require('./routes/jianshu/monthly'));
router.get('/jianshu/collection/:id', require('./routes/jianshu/collection'));
router.get('/jianshu/user/:id', require('./routes/jianshu/user'));

// // 知乎
router.get('/zhihu/collection/:id', require('./routes/zhihu/collection'));

module.exports = router;