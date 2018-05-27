const Router = require('koa-router');
const router = new Router();
const art = require('art-template');
const path = require('path');
const config = require('./config');
const logger = require('./utils/logger');

let gitHash;
try {
    gitHash = require('git-rev-sync').short();
} catch (e) {
    gitHash = (process.env.HEROKU_SLUG_COMMIT && process.env.HEROKU_SLUG_COMMIT.slice(0, 7)) || 'unknown';
}
const startTime = +new Date();
router.get('/', async (ctx) => {
    ctx.set({
        'Content-Type': 'text/html; charset=UTF-8',
    });

    const time = (+new Date() - startTime) / 1000;

    const routes = Object.keys(ctx.debug.routes).sort((a, b) => ctx.debug.routes[b] - ctx.debug.routes[a]);
    const hotRoutes = routes.slice(0, 10);
    let hotRoutesValue = '';
    hotRoutes.forEach((item) => {
        hotRoutesValue += `${ctx.debug.routes[item]}&nbsp;&nbsp;${item}<br>`;
    });

    const ips = Object.keys(ctx.debug.ips).sort((a, b) => ctx.debug.ips[b] - ctx.debug.ips[a]);
    const hotIPs = ips.slice(0, 10);
    let hotIPsValue = '';
    hotIPs.forEach((item) => {
        hotIPsValue += `${ctx.debug.ips[item]}&nbsp;&nbsp;${item}<br>`;
    });

    ctx.body = art(path.resolve(__dirname, './views/welcome.art'), {
        debug: [
            {
                name: 'git hash',
                value: gitHash,
            },
            {
                name: '请求数',
                value: ctx.debug.request,
            },
            {
                name: '请求频率',
                value: (ctx.debug.request / time * 60).toFixed(3) + ' 次/分钟',
            },
            {
                name: '缓存命中率',
                value: ctx.debug.request ? (ctx.debug.hitCache / ctx.debug.request).toFixed(3) : 0,
            },
            {
                name: '内存占用',
                value: process.memoryUsage().rss / 1000000 + ' MB',
            },
            {
                name: '运行时间',
                value: time + ' 秒',
            },
            {
                name: '热门路由',
                value: hotRoutesValue,
            },
            {
                name: '热门IP',
                value: hotIPsValue,
            },
        ],
    });
});

// RSSHub
router.get('/rsshub/rss', require('./routes/rsshub/rss'));

// bilibili
router.get('/bilibili/user/video/:uid', require('./routes/bilibili/video'));
router.get('/bilibili/user/fav/:uid', require('./routes/bilibili/fav'));
router.get('/bilibili/user/coin/:uid', require('./routes/bilibili/coin'));
router.get('/bilibili/user/dynamic/:uid', require('./routes/bilibili/dynamic'));
router.get('/bilibili/user/followers/:uid', require('./routes/bilibili/followers'));
router.get('/bilibili/user/followings/:uid', require('./routes/bilibili/followings'));
router.get('/bilibili/partion/:tid', require('./routes/bilibili/partion'));
router.get('/bilibili/bangumi/:seasonid', require('./routes/bilibili/bangumi'));
router.get('/bilibili/video/reply/:aid', require('./routes/bilibili/reply'));
router.get('/bilibili/link/news/:product', require('./routes/bilibili/linkNews'));
router.get('/bilibili/live/room/:roomID', require('./routes/bilibili/liveRoom'));
router.get('/bilibili/live/search/:key/:order', require('./routes/bilibili/liveSearch'));
router.get('/bilibili/live/area/:areaID/:order', require('./routes/bilibili/liveArea'));

// bangumi
router.get('/bangumi/calendar/today', require('./routes/bangumi/calendar/today'));

// 微博
router.get('/weibo/user/:uid', require('./routes/weibo/user'));
router.get('/weibo/user2/:uid', require('./routes/weibo/user2'));
router.get('/weibo/keyword/:keyword', require('./routes/weibo/keyword'));

// 网易云音乐
router.get('/ncm/playlist/:id', require('./routes/ncm/playlist'));
router.get('/ncm/user/playlist/:uid', require('./routes/ncm/userplaylist'));
router.get('/ncm/artist/:id', require('./routes/ncm/artist'));

// 掘金
router.get('/juejin/category/:category', require('./routes/juejin/category'));

// 自如
router.get('/ziroom/room/:city/:iswhole/:room/:keyword', require('./routes/ziroom/room'));

// 快递
router.get('/express/:company/:number', require('./routes/express/express'));

// 简书
router.get('/jianshu/home', require('./routes/jianshu/home'));
router.get('/jianshu/trending/weekly', require('./routes/jianshu/weekly'));
router.get('/jianshu/trending/monthly', require('./routes/jianshu/monthly'));
router.get('/jianshu/collection/:id', require('./routes/jianshu/collection'));
router.get('/jianshu/user/:id', require('./routes/jianshu/user'));

// 知乎
router.get('/zhihu/collection/:id', require('./routes/zhihu/collection'));
router.get('/zhihu/people/activities/:id', require('./routes/zhihu/activities'));
router.get('/zhihu/people/answers/:id', require('./routes/zhihu/answers'));
router.get('/zhihu/zhuanlan/:id', require('./routes/zhihu/zhuanlan'));
router.get('/zhihu/daily', require('./routes/zhihu/daily'));

// 贴吧
router.get('/tieba/forum/:kw', require('./routes/tieba/forum'));

// 妹子图
router.get('/mzitu', require('./routes/mzitu/category'));
router.get('/mzitu/tags', require('./routes/mzitu/tags'));
router.get('/mzitu/category/:category', require('./routes/mzitu/category'));
router.get('/mzitu/post/:id', require('./routes/mzitu/post'));
router.get('/mzitu/tag/:tag', require('./routes/mzitu/tag'));

// pixiv
if (config.pixiv && config.pixiv.client_id && config.pixiv.client_secret && config.pixiv.username && config.pixiv.password) {
    router.get('/pixiv/user/bookmarks/:id', require('./routes/pixiv/bookmarks'));
    router.get('/pixiv/user/:id/', require('./routes/pixiv/user'));
    router.get('/pixiv/ranking/:mode/:date?', require('./routes/pixiv/ranking'));
} else {
    logger.warn('pixiv RSS is disabled for lacking config.');
}

// 豆瓣
router.get('/douban/movie/playing', require('./routes/douban/playing'));
router.get('/douban/movie/playing/:score', require('./routes/douban/playing'));
router.get('/douban/movie/playing/:score/:city', require('./routes/douban/playing'));
router.get('/douban/movie/later', require('./routes/douban/later'));
router.get('/douban/movie/ustop', require('./routes/douban/ustop'));

// 煎蛋
router.get('/jandan/pic', require('./routes/jandan/pic'));

// 喷嚏
router.get('/dapenti/tugua', require('./routes/dapenti/tugua'));

// Dockone
router.get('/dockone/weekly', require('./routes/dockone/weekly'));

// 腾讯吐个槽
router.get('/tucaoqq/post/:project/:key', require('./routes/tucaoqq/post'));

// 笔趣阁
router.get('/biquge/novel/latestchapter/:id', require('./routes/biquge/chapter'));

// 开发者头条
router.get('/toutiao/today', require('./routes/toutiao/today'));
router.get('/toutiao/user/:id', require('./routes/toutiao/user'));

// 今日头条
router.get('/jinritoutiao/keyword/:keyword', require('./routes/jinritoutiao/keyword'));

// Disqus
if (config.disqus && config.disqus.api_key) {
    router.get('/disqus/posts/:forum', require('./routes/disqus/posts'));
} else {
    logger.warn('Disqus RSS is disabled for lacking config.');
}

// Twitter
if (config.twitter && config.twitter.consumer_key && config.twitter.consumer_secret && config.twitter.access_token && config.twitter.access_token_secret) {
    router.get('/twitter/user/:id', require('./routes/twitter/user'));
} else {
    logger.warn('Twitter RSS is disabled for lacking config.');
}

// Instagram
router.get('/instagram/user/:id', require('./routes/instagram/user'));

// Youtube
if (config.youtube && config.youtube.key) {
    router.get('/youtube/user/:username', require('./routes/youtube/user'));
    router.get('/youtube/channel/:id', require('./routes/youtube/channel'));
} else {
    logger.warn('Youtube RSS is disabled for lacking config.');
}

// 即刻
router.get('/jike/topic/:id', require('./routes/jike/topic'));
router.get('/jike/topic/square/:id', require('./routes/jike/topicSquare'));
router.get('/jike/user/:id', require('./routes/jike/user'));

// 极客时间
router.get('/geektime/column/:cid', require('./routes/geektime/column'));

// 爱奇艺
router.get('/iqiyi/dongman/:id', require('./routes/iqiyi/dongman'));

// 南方周末
router.get('/infzm/:id', require('./routes/infzm/news'));

// Dribbble
router.get('/dribbble/popular/:timeframe?', require('./routes/dribbble/popular'));
router.get('/dribbble/user/:name', require('./routes/dribbble/user'));
router.get('/dribbble/keyword/:keyword', require('./routes/dribbble/keyword'));

// 斗鱼
router.get('/douyu/room/:id', require('./routes/douyu/room'));

// 熊猫直播
router.get('/panda/room/:id', require('./routes/panda/room'));

// v2ex
router.get('/v2ex/topics/:type', require('./routes/v2ex/topics'));

// Telegram
if (config.telegram && config.telegram.token) {
    router.get('/telegram/channel/:username', require('./routes/telegram/channel'));
} else {
    logger.warn('Telegram RSS is disabled for lacking config.');
}

// readhub
router.get('/readhub/category/:category', require('./routes/readhub/category'));

// GitHub
if (config.github && config.github.access_token) {
    router.get('/github/repos/:user', require('./routes/github/repos'));
} else {
    logger.warn('GitHub RSS is disabled for lacking config.');
}

// konachan
router.get('/konachan/post', require('./routes/konachan/post'));
router.get('/konachan/post/popular_recent', require('./routes/konachan/post_popular_recent'));
router.get('/konachan/post/:tags', require('./routes/konachan/post'));
router.get('/konachan/post/popular_recent/:period', require('./routes/konachan/post_popular_recent'));

// yande.re
router.get('/yande.re/post', require('./routes/yande.re/post'));
router.get('/yande.re/post/popular_recent', require('./routes/yande.re/post_popular_recent'));
router.get('/yande.re/post/:tags', require('./routes/yande.re/post'));
router.get('/yande.re/post/popular_recent/:period', require('./routes/yande.re/post_popular_recent'));

module.exports = router;
