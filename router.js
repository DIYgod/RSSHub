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

    let showDebug;
    if (!config.debugInfo || config.debugInfo === 'false') {
        showDebug = false;
    } else {
        showDebug = config.debugInfo === true || config.debugInfo === ctx.query.debug;
    }

    ctx.set({
        'Cache-Control': 'no-cache',
    });
    ctx.body = art(path.resolve(__dirname, './views/welcome.art'), {
        showDebug,
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
                value: ((ctx.debug.request / time) * 60).toFixed(3) + ' 次/分钟',
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
router.get('/bilibili/user/article/:uid', require('./routes/bilibili/article'));
router.get('/bilibili/user/fav/:uid', require('./routes/bilibili/userFav'));
router.get('/bilibili/user/coin/:uid', require('./routes/bilibili/coin'));
router.get('/bilibili/user/dynamic/:uid', require('./routes/bilibili/dynamic'));
router.get('/bilibili/user/followers/:uid', require('./routes/bilibili/followers'));
router.get('/bilibili/user/followings/:uid', require('./routes/bilibili/followings'));
router.get('/bilibili/partion/:tid', require('./routes/bilibili/partion'));
router.get('/bilibili/partion/ranking/:tid/:days?', require('./routes/bilibili/partion-ranking'));
router.get('/bilibili/bangumi/:seasonid', require('./routes/bilibili/bangumi'));
router.get('/bilibili/video/reply/:aid', require('./routes/bilibili/reply'));
router.get('/bilibili/link/news/:product', require('./routes/bilibili/linkNews'));
router.get('/bilibili/live/room/:roomID', require('./routes/bilibili/liveRoom'));
router.get('/bilibili/live/search/:key/:order', require('./routes/bilibili/liveSearch'));
router.get('/bilibili/live/area/:areaID/:order', require('./routes/bilibili/liveArea'));
router.get('/bilibili/fav/:uid/:fid', require('./routes/bilibili/fav'));
router.get('/bilibili/blackboard', require('./routes/bilibili/blackboard'));
router.get('/bilibili/mall/new', require('./routes/bilibili/mallNew'));
router.get('/bilibili/mall/ip/:id', require('./routes/bilibili/mallIP'));
router.get('/bilibili/ranking/:rid?/:day?', require('./routes/bilibili/ranking'));
router.get('/bilibili/channel/:uid/:cid', require('./routes/bilibili/userChannel'));
router.get('/bilibili/topic/:topic', require('./routes/bilibili/topic'));

// bangumi
router.get('/bangumi/calendar/today', require('./routes/bangumi/calendar/today'));
router.get('/bangumi/subject/:id/:type', require('./routes/bangumi/subject'));
router.get('/bangumi/person/:id', require('./routes/bangumi/person'));
router.get('/bangumi/topic/:id', require('./routes/bangumi/group/reply.js'));

// 微博
router.get('/weibo/user/:uid', require('./routes/weibo/user'));
router.get('/weibo/user2/:uid', require('./routes/weibo/user2'));
router.get('/weibo/keyword/:keyword', require('./routes/weibo/keyword'));

// 贴吧
router.get('/tieba/forum/:kw', require('./routes/tieba/forum'));
router.get('/tieba/forum/good/:kw/:cid?', require('./routes/tieba/forum'));
router.get('/tieba/post/:id', require('./routes/tieba/post'));
router.get('/tieba/post/lz/:id', require('./routes/tieba/post'));

// 网易云音乐
router.get('/ncm/playlist/:id', require('./routes/ncm/playlist'));
router.get('/ncm/user/playlist/:uid', require('./routes/ncm/userplaylist'));
router.get('/ncm/artist/:id', require('./routes/ncm/artist'));
router.get('/ncm/djradio/:id', require('./routes/ncm/djradio'));

// 掘金
router.get('/juejin/category/:category', require('./routes/juejin/category'));
router.get('/juejin/tag/:tag', require('./routes/juejin/tag'));
router.get('/juejin/trending/:category/:type', require('./routes/juejin/trending'));

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
router.get('/zhihu/hotlist', require('./routes/zhihu/hotlist'));

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
router.get('/douban/group/:groupid', require('./routes/douban/group'));
router.get('/douban/explore', require('./routes/douban/explore'));
router.get('/douban/music/latest', require('./routes/douban/latest_music'));
router.get('/douban/book/latest', require('./routes/douban/latest_book'));

// 煎蛋
router.get('/jandan/:sub_model', require('./routes/jandan/pic'));

// 喷嚏
router.get('/dapenti/tugua', require('./routes/dapenti/tugua'));

// Dockone
router.get('/dockone/weekly', require('./routes/dockone/weekly'));

// 腾讯吐个槽
router.get('/tucaoqq/post/:project/:key', require('./routes/tucaoqq/post'));

// 开发者头条
router.get('/toutiao/today', require('./routes/toutiao/today'));
router.get('/toutiao/user/:id', require('./routes/toutiao/user'));

// 众成翻译
router.get('/zcfy/index', require('./routes/zcfy/index'));
router.get('/zcfy/hot', require('./routes/zcfy/hot'));

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
router.get('/jike/topic/text/:id', require('./routes/jike/topicText'));
router.get('/jike/topic/square/:id', require('./routes/jike/topicSquare'));
router.get('/jike/user/:id', require('./routes/jike/user'));
router.get('/jike/daily', require('./routes/jike/daily'));

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
    if (config.imgur && config.imgur.clientId) {
        router.get('/telegram/stickerpack/:name', require('./routes/telegram/stickerpack'));
    } else {
        logger.warn('Telegram Sticker Pack RSS is disabled for lacking config.');
    }
} else {
    logger.warn('Telegram RSS is disabled for lacking config.');
}

// readhub
router.get('/readhub/category/:category', require('./routes/readhub/category'));

// GitHub
if (config.github && config.github.access_token) {
    router.get('/github/repos/:user', require('./routes/github/repos'));
} else {
    logger.warn('GitHub Repos RSS is disabled for lacking config.');
}
router.get('/github/trending/:since/:language?', require('./routes/github/trending'));
router.get('/github/issue/:user/:repo', require('./routes/github/issue'));
router.get('/github/user/followers/:user', require('./routes/github/follower'));
router.get('/github/stars/:user/:repo', require('./routes/github/star'));

// konachan
router.get('/konachan/post/popular_recent', require('./routes/konachan/post_popular_recent'));
router.get('/konachan.com/post/popular_recent', require('./routes/konachan/post_popular_recent'));
router.get('/konachan.net/post/popular_recent', require('./routes/konachan/post_popular_recent'));
router.get('/konachan/post/popular_recent/:period', require('./routes/konachan/post_popular_recent'));
router.get('/konachan.com/post/popular_recent/:period', require('./routes/konachan/post_popular_recent'));
router.get('/konachan.net/post/popular_recent/:period', require('./routes/konachan/post_popular_recent'));

// yande.re
router.get('/yande.re/post/popular_recent', require('./routes/yande.re/post_popular_recent'));
router.get('/yande.re/post/popular_recent/:period', require('./routes/yande.re/post_popular_recent'));

// 纽约时报
router.get('/nytimes/morning_post', require('./routes/nytimes/morning_post'));

// 3dm
router.get('/3dm/:name/download', require('./routes/3dm/download'));
router.get('/3dm/:name/:type', require('./routes/3dm/news'));
router.get('/3dm/news', require('./routes/3dm/news_center'));

// 喜马拉雅
router.get('/ximalaya/album/:classify/:id', require('./routes/ximalaya/album'));
router.get('/ximalaya/album/:id', require('./routes/ximalaya/album'));

// EZTV
router.get('/eztv/torrents/:imdb_id', require('./routes/eztv/imdb'));

// 什么值得买
router.get('/smzdm/keyword/:keyword', require('./routes/smzdm/keyword'));
router.get('/smzdm/ranking/:rank_type/:rank_id/:hour', require('./routes/smzdm/ranking'));

// 新京报
router.get('/bjnews/:cat', require('./routes/bjnews/news'));

// 停水通知
router.get('/tingshuitz/hangzhou', require('./routes/tingshuitz/hangzhou'));
router.get('/tingshuitz/xiaoshan', require('./routes/tingshuitz/xiaoshan'));
router.get('/tingshuitz/dalian', require('./routes/tingshuitz/dalian'));

// MIUI 更新
router.get('/miui/:device/:type?', require('./routes/miui/index'));

// 米哈游
router.get('/mihoyo/bh3/:type', require('./routes/mihoyo/bh3'));
router.get('/mihoyo/bh2/:type', require('./routes/mihoyo/bh2'));

// 央视新闻
router.get('/cctv/:category', require('./routes/cctv/category'));

// 财新
router.get('/caixin/:column/:category', require('./routes/caixin/category'));

// 草榴社区
router.get('/t66y/:id', require('./routes/t66y/index'));

// 科技星球
router.get('/kejixingqiu/home', require('./routes/kejixingqiu/home'));

// 机核
router.get('/gcores/category/:category', require('./routes/gcores/category'));

// 国家地理
router.get('/natgeo/:cat/:type?', require('./routes/natgeo/natgeo'));

// 一个
router.get('/one', require('./routes/one/index'));

// Firefox
router.get('/firefox/release/:platform', require('./routes/firefox/release'));

// tuicool
router.get('/tuicool/mags/:type', require('./routes/tuicool/mags'));

// Hexo
router.get('/hexo/next/:url', require('./routes/hexo/next'));

// 小米
router.get('/mi/crowdfunding', require('./routes/mi/crowdfunding'));

// Keep
router.get('/keep/user/:id', require('./routes/keep/user'));

// 起点
router.get('/qidian/chapter/:id', require('./routes/qidian/chapter'));
router.get('/qidian/forum/:id', require('./routes/qidian/forum'));

// 中国美术馆
router.get('/namoc/announcement', require('./routes/namoc/announcement'));
router.get('/namoc/news', require('./routes/namoc/news'));
router.get('/namoc/media', require('./routes/namoc/media'));
router.get('/namoc/exhibition', require('./routes/namoc/exhibition'));
router.get('/namoc/specials', require('./routes/namoc/specials'));

// 懂球帝
router.get('/dongqiudi/daily', require('./routes/dongqiudi/daily'));
router.get('/dongqiudi/result/:team', require('./routes/dongqiudi/result'));

// 维基百科
router.get('/wikipedia/mainland', require('./routes/wikipedia/mainland'));

// 雪球
router.get('/xueqiu/user/:id/:type?', require('./routes/xueqiu/user'));
router.get('/xueqiu/favorite/:id', require('./routes/xueqiu/favorite'));

// Greasy Fork
router.get('/greasyfork/:language/:domain?', require('./routes/greasyfork/scripts'));

// LinkedKeeper
router.get('/linkedkeeper/:type/:id?', require('./routes/linkedkeeper/index'));

// 开源中国
router.get('/oschina/news', require('./routes/oschina/news'));

// 腾讯视频 SDK
router.get('/qcloud/mlvb/changelog', require('./routes/qcloud/mlvb/changelog'));

// Bugly SDK
router.get('/bugly/changelog/:platform', require('./routes/bugly/changelog'));

// All the Flight Deals
router.get('/atfd/:locations/:nearby?', require('./routes/atfd/index'));

// Fir
router.get('/fir/update/:id', require('./routes/fir/update'));

// Google
router.get('/google/scholar/:query', require('./routes/google/scholar'));

// Awesome Pigtals
router.get('/pigtails', require('./routes/pigtails'));

// 每日环球展览 iMuseum
router.get('/imuseum/:city/:type', require('./routes/imuseum'));

// AppStore
router.get('/appstore/update/:country/:id', require('./routes/appstore/update'));
router.get('/appstore/price/:country/:type/:id', require('./routes/appstore/price'));
router.get('/appstore/iap/:country/:id', require('./routes/appstore/in-app-purchase'));

// Hopper
router.get('/hopper/:lowestOnly/:from/:to?', require('./routes/hopper/index'));

// wechat
router.get('/wechat/wasi/:id', require('./routes/wechat/wasi'));

// 马蜂窝
router.get('/mafengwo/note/:type', require('./routes/mafengwo/note'));

// 中国地震局震情速递（与地震台网同步更新）
router.get('/earthquake', require('./routes/earthquake'));

// 笔趣阁
router.get('/biquge/novel/latestchapter/:id', require('./routes/novel/biquge'));

// UU看书
router.get('/uukanshu/chapter/:uid', require('./routes/novel/uukanshu'));

// 小说
router.get('/novel/biquge/:id', require('./routes/novel/biquge'));
router.get('/novel/uukanshu/:uid', require('./routes/novel/uukanshu'));
router.get('/novel/wenxuemi/:id1/:id2', require('./routes/novel/wenxuemi'));

// 中国气象网
router.get('/weatherAlarm', require('./routes/weatherAlarm'));

// Gitlab
router.get('/gitlab/explore/:type', require('./routes/gitlab/explore'));

// 忧郁的弟弟
router.get('/mygalgame', require('./routes/galgame/mygalgame'));

// 大连工业大学
router.get('/dpu/jiaowu/news/:type?', require('./routes/universities/dpu/jiaowu/news'));
router.get('/dpu/wlfw/news/:type?', require('./routes/universities/dpu/wlfw/news'));

// 东南大学
router.get('/seu/radio/academic', require('./routes/universities/seu/radio/academic'));

// 哈尔滨工业大学
router.get('/hit/jwc', require('./routes/universities/hit/jwc'));

// 上海科技大学
router.get('/shanghaitech/sist/activity', require('./routes/universities/shanghaitech/sist/activity'));

// 上海交通大学
router.get('/sjtu/seiee/academic', require('./routes/universities/sjtu/seiee/academic'));

// 江南大学
router.get('/ju/jwc/:type?', require('./routes/universities/ju/jwc'));

// 北京大学
router.get('/pku/eecs/:type?', require('./routes/universities/pku/eecs'));

// 上海海事大学
router.get('/shmtu/events', require('./routes/universities/shmtu/events'));
router.get('/shmtu/notes', require('./routes/universities/shmtu/notes'));
router.get('/shmtu/jwc/:type', require('./routes/universities/shmtu/jwc'));

// 西南科技大学
router.get('/swust/jwc/:type', require('./routes/universities/swust/jwc'));
router.get('/swust/cs/:type', require('./routes/universities/swust/cs'));

// 华南师范大学
router.get('/scnu/jw', require('./routes/universities/scnu/jw'));
router.get('/scnu/library', require('./routes/universities/scnu/library'));
router.get('/scnu/cs/match', require('./routes/universities/scnu/cs/match'));

// 中国科学院
router.get('/cas/sim/academic', require('./routes/universities/cas/sim/academic'));

// 南京邮电大学
router.get('/njupt/jwc/:type?', require('./routes/universities/njupt/jwc'));

// 哈尔滨工程大学
router.get('/heu/ugs/news/:author?/:category?', require('./routes/universities/heu/ugs/news'));

// ifanr
router.get('/ifanr/appso', require('./routes/ifanr/appso'));

// 果壳网
router.get('/guokr/scientific', require('./routes/guokr/scientific'));

// 联合早报
router.get('/zaobao/realtime/:type?', require('./routes/zaobao/realtime'));
router.get('/zaobao/znews/:type?', require('./routes/zaobao/znews'));

// Apple
router.get('/apple/exchange_repair', require('./routes/apple/exchange_repair'));

// XKCD
router.get('/xkcd/comic', require('./routes/xkcd/comic'));

// Minecraft CurseForge
router.get('/curseforge/files/:project', require('./routes/curseforge/files'));

// 抖音
router.get('/douyin/user/:id', require('./routes/douyin/user'));

// 少数派 sspai
router.get('/sspai/series', require('./routes/sspai/series'));

// xclient.info
router.get('/xclient/app/:name', require('./routes/xclient/app'));

module.exports = router;
