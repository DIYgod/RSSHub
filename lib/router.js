const Router = require('koa-router');
const router = new Router();
const art = require('art-template');
const path = require('path');
const config = require('./config');
const logger = require('./utils/logger');
const pidusage = require('pidusage');

let gitHash;
try {
    gitHash = require('git-rev-sync').short();
} catch (e) {
    gitHash = (process.env.HEROKU_SLUG_COMMIT && process.env.HEROKU_SLUG_COMMIT.slice(0, 7)) || 'unknown';
}
router.get('/', async (ctx) => {
    ctx.set({
        'Content-Type': 'text/html; charset=UTF-8',
    });

    const routes = Object.keys(ctx.debug.routes).sort((a, b) => ctx.debug.routes[b] - ctx.debug.routes[a]);
    const hotRoutes = routes.slice(0, 50);
    let hotRoutesValue = '';
    hotRoutes.forEach((item) => {
        hotRoutesValue += `${ctx.debug.routes[item]}&nbsp;&nbsp;${item}<br>`;
    });

    const ips = Object.keys(ctx.debug.ips).sort((a, b) => ctx.debug.ips[b] - ctx.debug.ips[a]);
    const hotIPs = ips.slice(0, 50);
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

    const stats = await pidusage(process.pid);

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
                value: ((ctx.debug.request / (stats.elapsed / 1000)) * 60).toFixed(3) + ' 次/分钟',
            },
            {
                name: '缓存命中率',
                value: ctx.debug.request ? (ctx.debug.hitCache / ctx.debug.request).toFixed(3) : 0,
            },
            {
                name: '内存占用',
                value: stats.memory / 1000000 + ' MB',
            },
            {
                name: 'CPU 占用',
                value: stats.cpu + '%',
            },
            {
                name: '运行时间',
                value: (stats.elapsed / 3600000).toFixed(2) + ' 小时',
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

router.get('/test/:id', (ctx) => {
    ctx.state.data = {
        title: `Test ${ctx.params.id}`,
        link: 'https://github.com/DIYgod/RSSHub',
        item: [
            {
                title: 'Title1',
                description: 'Item1',
                pubDate: new Date('2018-4-2').toUTCString(),
                link: 'https://github.com/DIYgod/RSSHub/issues/1',
            },
            {
                title: 'Title2',
                description: 'Item2',
                pubDate: new Date('2018-4-10').toUTCString(),
                link: 'https://github.com/DIYgod/RSSHub/issues/2',
            },
        ],
    };
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
router.get('/bilibili/bangumi/:seasonid', require('./routes/bilibili/bangumi')); // 弃用
router.get('/bilibili/bangumi/media/:mediaid', require('./routes/bilibili/bangumi'));
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
router.get('/bilibili/user/channel/:uid/:cid', require('./routes/bilibili/userChannel'));
router.get('/bilibili/topic/:topic', require('./routes/bilibili/topic'));
router.get('/bilibili/audio/:id', require('./routes/bilibili/audio'));

// bangumi
router.get('/bangumi/calendar/today', require('./routes/bangumi/calendar/today'));
router.get('/bangumi/subject/:id/:type', require('./routes/bangumi/subject'));
router.get('/bangumi/person/:id', require('./routes/bangumi/person'));
router.get('/bangumi/topic/:id', require('./routes/bangumi/group/reply'));
router.get('/bangumi/group/:id', require('./routes/bangumi/group/topic'));
router.get('/bangumi/subject/:id', require('./routes/bangumi/subject'));

// 微博
router.get('/weibo/user/:uid', require('./routes/weibo/user'));
router.get('/weibo/user2/:uid', require('./routes/weibo/user2'));
router.get('/weibo/keyword/:keyword', require('./routes/weibo/keyword'));
router.get('/weibo/search/hot', require('./routes/weibo/search/hot'));

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
router.get('/juejin/books', require('./routes/juejin/books'));
router.get('/juejin/pins', require('./routes/juejin/pins'));

// 自如
router.get('/ziroom/room/:city/:iswhole/:room/:keyword', require('./routes/ziroom/room'));

// 快递
router.get('/express/:company/:number', require('./routes/express/express'));

// 简书
router.get('/jianshu/home', require('./routes/jianshu/home'));
router.get('/jianshu/trending/:timeframe', require('./routes/jianshu/trending'));
router.get('/jianshu/collection/:id', require('./routes/jianshu/collection'));
router.get('/jianshu/user/:id', require('./routes/jianshu/user'));

// 知乎
router.get('/zhihu/collection/:id', require('./routes/zhihu/collection'));
router.get('/zhihu/people/activities/:id', require('./routes/zhihu/activities'));
router.get('/zhihu/people/answers/:id', require('./routes/zhihu/answers'));
router.get('/zhihu/zhuanlan/:id', require('./routes/zhihu/zhuanlan'));
router.get('/zhihu/daily', require('./routes/zhihu/daily'));
router.get('/zhihu/hotlist', require('./routes/zhihu/hotlist'));
router.get('/zhihu/pin/hotlist', require('./routes/zhihu/pin/hotlist'));
router.get('/zhihu/question/:questionId', require('./routes/zhihu/question'));
router.get('/zhihu/topic/:topicId', require('./routes/zhihu/topic'));
router.get('/zhihu/people/pins/:id', require('./routes/zhihu/pin/people'));
router.get('/zhihu/bookstore/newest', require('./routes/zhihu/bookstore/newest'));
router.get('/zhihu/pin/daily', require('./routes/zhihu/pin/daily'));

// 妹子图
router.get('/mzitu/home/:type?', require('./routes/mzitu/home'));
router.get('/mzitu/tags', require('./routes/mzitu/tags'));
router.get('/mzitu/category/:category', require('./routes/mzitu/category'));
router.get('/mzitu/post/:id', require('./routes/mzitu/post'));
router.get('/mzitu/tag/:tag', require('./routes/mzitu/tag'));

// pixiv
if (config.pixiv && config.pixiv.client_id && config.pixiv.client_secret && config.pixiv.username && config.pixiv.password) {
    router.get('/pixiv/user/bookmarks/:id', require('./routes/pixiv/bookmarks'));
    router.get('/pixiv/user/:id/', require('./routes/pixiv/user'));
    router.get('/pixiv/ranking/:mode/:date?', require('./routes/pixiv/ranking'));
    router.get('/pixiv/search/:keyword/:order?', require('./routes/pixiv/search'));
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
router.get('/douban/music/latest/:area?', require('./routes/douban/latest_music'));
router.get('/douban/book/latest', require('./routes/douban/latest_book'));
router.get('/douban/event/hot/:locationId', require('./routes/douban/event/hot'));
router.get('/douban/commercialpress/latest', require('./routes/douban/commercialpress/latest'));
router.get('/douban/bookstore', require('./routes/douban/bookstore'));
router.get('/douban/book/rank/:type', require('./routes/douban/book/rank'));

// 煎蛋
router.get('/jandan/:sub_model', require('./routes/jandan/pic'));

// 喷嚏
router.get('/dapenti/tugua', require('./routes/dapenti/tugua'));
router.get('/dapenti/subject/:id', require('./routes/dapenti/subject'));

// Dockone
router.get('/dockone/weekly', require('./routes/dockone/weekly'));

// 开发者头条
router.get('/toutiao/today', require('./routes/toutiao/today'));
router.get('/toutiao/user/:id', require('./routes/toutiao/user'));

// 众成翻译
router.get('/zcfy', require('./routes/zcfy/index'));
router.get('/zcfy/index', require('./routes/zcfy/index')); // 兼容
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
    router.get('/twitter/list/:id/:name', require('./routes/twitter/list'));
    router.get('/twitter/likes/:id', require('./routes/twitter/likes'));
} else {
    logger.warn('Twitter RSS is disabled for lacking config.');
}

// Instagram
router.get('/instagram/user/:id', require('./routes/instagram/user'));

// Youtube
if (config.youtube && config.youtube.key) {
    router.get('/youtube/user/:username/:embed?', require('./routes/youtube/user'));
    router.get('/youtube/channel/:id/:embed?', require('./routes/youtube/channel'));
    router.get('/youtube/playlist/:id/:embed?', require('./routes/youtube/playlist'));
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

// 虎牙
router.get('/huya/live/:id', require('./routes/huya/live'));

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
router.get('/github/search/:query/:sort?/:order?', require('./routes/github/search'));

// f-droid
router.get('/fdroid/apprelease/:app', require('./routes/fdroid/apprelease'));

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
router.get('/nytimes', require('./routes/nytimes/index'));
router.get('/nytimes/morning_post', require('./routes/nytimes/morning_post'));

// 3dm
router.get('/3dm/:name/:type', require('./routes/3dm/game'));
router.get('/3dm/news', require('./routes/3dm/news_center'));

// 旅法师营地
router.get('/lfsyd/:typecode', require('./routes/lfsyd/index'));

// 喜马拉雅
router.get('/ximalaya/album/:id/:all?', require('./routes/ximalaya/album'));

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
router.get('/tingshuitz/guangzhou', require('./routes/tingshuitz/guangzhou'));
router.get('/tingshuitz/dongguan', require('./routes/tingshuitz/dongguan'));

// MIUI 更新
router.get('/miui/:device/:type?/:region?', require('./routes/miui/index'));

// 米哈游
router.get('/mihoyo/bh3/:type', require('./routes/mihoyo/bh3'));
router.get('/mihoyo/bh2/:type', require('./routes/mihoyo/bh2'));

// 央视新闻
router.get('/cctv/:category', require('./routes/cctv/category'));

// 财新
router.get('/caixin/:column/:category', require('./routes/caixin/category'));

// 草榴社区
router.get('/t66y/post/:tid', require('./routes/t66y/post'));
router.get('/t66y/:id/:type?', require('./routes/t66y/index'));

// 色中色
router.get('/sexinsex/:id/:type?', require('./routes/sexinsex/index'));

// 机核
router.get('/gcores/category/:category', require('./routes/gcores/category'));

// 国家地理
router.get('/natgeo/:cat/:type?', require('./routes/natgeo/natgeo'));

// 一个
router.get('/one', require('./routes/one/index'));

// Firefox
router.get('/firefox/release/:platform', require('./routes/firefox/release'));

// Thunderbird
router.get('/thunderbird/release', require('./routes/thunderbird/release'));

// tuicool
router.get('/tuicool/mags/:type', require('./routes/tuicool/mags'));

// Hexo
router.get('/hexo/next/:url', require('./routes/hexo/next'));

// 小米
router.get('/mi/crowdfunding', require('./routes/mi/crowdfunding'));
router.get('/mi/youpin/crowdfunding', require('./routes/mi/youpin/crowdfunding'));
router.get('/mi/youpin/new', require('./routes/mi/youpin/new'));

// Keep
router.get('/keep/user/:id', require('./routes/keep/user'));

// 起点
router.get('/qidian/chapter/:id', require('./routes/qidian/chapter'));
router.get('/qidian/forum/:id', require('./routes/qidian/forum'));

// 纵横
router.get('/zongheng/chapter/:id', require('./routes/zongheng/chapter'));

// 刺猬猫
router.get('/ciweimao/chapter/:id', require('./routes/ciweimao/chapter'));

// 中国美术馆
router.get('/namoc/announcement', require('./routes/namoc/announcement'));
router.get('/namoc/news', require('./routes/namoc/news'));
router.get('/namoc/media', require('./routes/namoc/media'));
router.get('/namoc/exhibition', require('./routes/namoc/exhibition'));
router.get('/namoc/specials', require('./routes/namoc/specials'));

// 懂球帝
router.get('/dongqiudi/daily', require('./routes/dongqiudi/daily'));
router.get('/dongqiudi/result/:team', require('./routes/dongqiudi/result'));
router.get('/dongqiudi/team_news/:team', require('./routes/dongqiudi/team_news'));
router.get('/dongqiudi/player_news/:id', require('./routes/dongqiudi/player_news'));

// 维基百科 Wikipedia
router.get('/wikipedia/mainland', require('./routes/wikipedia/mainland'));

// 联合国 United Nations
router.get('/un/scveto', require('./routes/un/scveto'));

// 雪球
router.get('/xueqiu/user/:id/:type?', require('./routes/xueqiu/user'));
router.get('/xueqiu/favorite/:id', require('./routes/xueqiu/favorite'));
router.get('/xueqiu/user_stock/:id', require('./routes/xueqiu/user_stock'));
router.get('/xueqiu/fund/:id', require('./routes/xueqiu/fund'));

// Greasy Fork
router.get('/greasyfork/:language/:domain?', require('./routes/greasyfork/scripts'));

// LinkedKeeper
router.get('/linkedkeeper/:type/:id?', require('./routes/linkedkeeper/index'));

// 开源中国
router.get('/oschina/news', require('./routes/oschina/news'));

// 安全客
router.get('/aqk/vul', require('./routes/aqk/vul'));
router.get('/aqk/:category', require('./routes/aqk/category'));

// 腾讯大家
router.get('/dajia', require('./routes/tencent/dajia/index'));

// 腾讯游戏开发者社区
router.get('/gameinstitute/community/:tag?', require('./routes/tencent/gameinstitute/community'));

// 腾讯视频 SDK
router.get('/qcloud/mlvb/changelog', require('./routes/tencent/qcloud/mlvb/changelog'));

// 腾讯吐个槽
router.get('/tucaoqq/post/:project/:key', require('./routes/tencent/tucaoqq/post'));

// Bugly SDK
router.get('/bugly/changelog/:platform', require('./routes/tencent/bugly/changelog'));

// wechat
router.get('/wechat/wasi/:id', require('./routes/tencent/wechat/wasi'));
router.get('/wechat/announce', require('./routes/tencent/wechat/announce'));
router.get('/wechat/miniprogram/plugins', require('./routes/tencent/wechat/miniprogram/plugins'));

// All the Flight Deals
router.get('/atfd/:locations/:nearby?', require('./routes/atfd/index'));

// Fir
router.get('/fir/update/:id', require('./routes/fir/update'));

// Nvidia Web Driver
router.get('/nvidia/webdriverupdate', require('./routes/nvidia/webdriverupdate'));

// Google
router.get('/google/scholar/:query', require('./routes/google/scholar'));
router.get('/google/doodles/:language?', require('./routes/google/doodles'));

// Awesome Pigtals
router.get('/pigtails', require('./routes/pigtails'));

// 每日环球展览 iMuseum
router.get('/imuseum/:city/:type', require('./routes/imuseum'));

// AppStore
router.get('/appstore/update/:country/:id', require('./routes/appstore/update'));
router.get('/appstore/price/:country/:type/:id', require('./routes/appstore/price'));
router.get('/appstore/iap/:country/:id', require('./routes/appstore/in-app-purchase'));
router.get('/appstore/xianmian', require('./routes/appstore/xianmian'));

// Hopper
router.get('/hopper/:lowestOnly/:from/:to?', require('./routes/hopper/index'));

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
router.get('/novel/booksky/:id', require('./routes/novel/booksky'));

// 中国气象网
router.get('/weatheralarm', require('./routes/weatheralarm'));

// Gitlab
router.get('/gitlab/explore/:type', require('./routes/gitlab/explore'));

// 忧郁的loli 换了域名，向下兼容
router.get('/mygalgame', require('./routes/galgame/mmgal'));
router.get('/mmgal', require('./routes/galgame/mmgal'));

// 大连工业大学
router.get('/dpu/jiaowu/news/:type?', require('./routes/universities/dpu/jiaowu/news'));
router.get('/dpu/wlfw/news/:type?', require('./routes/universities/dpu/wlfw/news'));

// 东南大学
router.get('/seu/radio/academic', require('./routes/universities/seu/radio/academic'));
router.get('/seu/yzb/:type', require('./routes/universities/seu/yzb'));
router.get('/seu/cse/:type?', require('./routes/universities/seu/cse'));

// 南京航空航天大学
router.get('/nuaa/jwc/:type?', require('./routes/universities/nuaa/jwc/jwc'));
router.get('/nuaa/cs/:type?', require('./routes/universities/nuaa/cs/index'));

// 哈尔滨工业大学
router.get('/hit/jwc', require('./routes/universities/hit/jwc'));

// 上海科技大学
router.get('/shanghaitech/sist/activity', require('./routes/universities/shanghaitech/sist/activity'));

// 上海交通大学
router.get('/sjtu/seiee/academic', require('./routes/universities/sjtu/seiee/academic'));
router.get('/sjtu/seiee/bjwb/major_select', require('./routes/universities/sjtu/seiee/bjwb/major_select'));
router.get('/sjtu/seiee/bjwb/major_transfer', require('./routes/universities/sjtu/seiee/bjwb/major_transfer'));
router.get('/sjtu/seiee/bjwb/postgraduate', require('./routes/universities/sjtu/seiee/bjwb/postgraduate'));
router.get('/sjtu/seiee/bjwb/abroad', require('./routes/universities/sjtu/seiee/bjwb/abroad'));
router.get('/sjtu/seiee/bjwb/international', require('./routes/universities/sjtu/seiee/bjwb/international'));
router.get('/sjtu/seiee/xsb/:type?', require('./routes/universities/sjtu/seiee/xsb'));

router.get('/sjtu/gs/tzgg/:type?', require('./routes/universities/sjtu/gs/tzgg'));

// 江南大学
router.get('/ju/jwc/:type?', require('./routes/universities/ju/jwc'));

// 北京大学
router.get('/pku/eecs/:type?', require('./routes/universities/pku/eecs'));

// 上海海事大学
router.get('/shmtu/events', require('./routes/universities/shmtu/events'));
router.get('/shmtu/notes', require('./routes/universities/shmtu/notes'));
router.get('/shmtu/jwc/:type', require('./routes/universities/shmtu/jwc'));

// 西南科技大学
router.get('/swust/jwc/news', require('./routes/universities/swust/jwc_news'));
router.get('/swust/jwc/notice/:type?', require('./routes/universities/swust/jwc_notice'));
router.get('/swust/cs/:type?', require('./routes/universities/swust/cs'));

// 华南师范大学
router.get('/scnu/jw', require('./routes/universities/scnu/jw'));
router.get('/scnu/library', require('./routes/universities/scnu/library'));
router.get('/scnu/cs/match', require('./routes/universities/scnu/cs/match'));

// 中国科学院
router.get('/cas/sim/academic', require('./routes/universities/cas/sim/academic'));

// 南京邮电大学
router.get('/njupt/jwc/:type?', require('./routes/universities/njupt/jwc'));

// 南昌航空大学
router.get('/nchu/jwc/:type?', require('./routes/universities/nchu/jwc'));

// 哈尔滨工程大学
router.get('/heu/ugs/news/:author?/:category?', require('./routes/universities/heu/ugs/news'));

// 重庆大学
router.get('/cqu/jwc/announcement', require('./routes/universities/cqu/jwc/announcement'));

// 南京信息工程大学
router.get('/nuist/bulletin/:category?', require('./routes/universities/nuist/bulletin'));
router.get('/nuist/jwc/:category?', require('./routes/universities/nuist/jwc'));
router.get('/nuist/yjs/:category?', require('./routes/universities/nuist/yjs'));
router.get('/nuist/xgc', require('./routes/universities/nuist/xgc'));
router.get('/nuist/scs/:category?', require('./routes/universities/nuist/scs'));
router.get('/nuist/lib', require('./routes/universities/nuist/library/lib'));
router.get('/nuist/sese/:category?', require('./routes/universities/nuist/sese'));
router.get('/nuist/cas/:category?', require('./routes/universities/nuist/cas'));

// 成都信息工程大学
router.get('/cuit/cxxww/:type?', require('./routes/universities/cuit/cxxww'));

// 重庆科技学院
router.get('/cqust/jw/:type?', require('./routes/universities/cqust/jw'));
router.get('/cqust/lib/:type?', require('./routes/universities/cqust/lib'));

// 常州大学
router.get('/cczu/jwc/:category?', require('./routes/universities/cczu/jwc'));
router.get('/cczu/news/:category?', require('./routes/universities/cczu/news'));

// 南京理工大学
router.get('/njust/jwc/:type', require('./routes/universities/njust/jwc'));
router.get('/njust/cwc/:type', require('./routes/universities/njust/cwc'));
router.get('/njust/gs/:type', require('./routes/universities/njust/gs'));

// 四川旅游学院
router.get('/sctu/xgxy', require('./routes/universities/sctu/information-engineer-faculty/index'));
router.get('/sctu/xgxy/:id', require('./routes/universities/sctu/information-engineer-faculty/context'));
router.get('/sctu/jwc/:type?', require('./routes/universities/sctu/jwc/index'));
router.get('/sctu/jwc/:type/:id', require('./routes/universities/sctu/jwc/context'));

// 电子科技大学
router.get('/uestc/jwc/:type?', require('./routes/universities/uestc/jwc'));
router.get('/uestc/news/:type?', require('./routes/universities/uestc/news'));

// 昆明理工大学
router.get('/kmust/jwc/:type?', require('./routes/universities/kmust/jwc'));
router.get('/kmust/job/careers/:type?', require('./routes/universities/kmust/job/careers'));
router.get('/kmust/job/jobfairs', require('./routes/universities/kmust/job/jobfairs'));

// 华中科技大学
router.get('/hust/auto/notice/:type?', require('./routes/universities/hust/auto/notice'));
router.get('/hust/auto/news/', require('./routes/universities/hust/auto/news'));

// 山东大学
router.get('/sdu/grad/academic', require('./routes/universities/sdu/grad/academic'));
router.get('/sdu/sc/:type?', require('./routes/universities/sdu/sc'));
router.get('/sdu/cmse/:type?', require('./routes/universities/sdu/cmse'));
router.get('/sdu/mech/:type?', require('./routes/universities/sdu/mech'));
router.get('/sdu/epe/:type?', require('./routes/universities/sdu/epe'));

// 大连大学
router.get('/dlu/jiaowu/news', require('./routes/universities/dlu/jiaowu/news'));

// 东莞理工学院
router.get('/dgut/jwc/:type?', require('./routes/universities/dgut/jwc'));
router.get('/dgut/xsc/:type?', require('./routes/universities/dgut/xsc'));

// 同济大学
router.get('/tju/sse/:type?', require('./routes/universities/tju/sse/notice'));

// 华南理工大学
router.get('/scut/jwc/:category?', require('./routes/universities/scut/jwc'));

// 温州商学院
router.get('/wzbc/:type?', require('./routes/universities/wzbc/news'));

// 河南大学
router.get('/henu/:type?', require('./routes/universities/henu/news'));

// 南开大学
router.get('/nku/jwc/:type?', require('./routes/universities/nku/jwc/index'));

// 北京航空航天大学
router.get('/buaa/news/:type', require('./routes/universities/buaa/news/index'));

// ifanr
router.get('/ifanr/:channel?', require('./routes/ifanr/index'));

// 果壳网
router.get('/guokr/scientific', require('./routes/guokr/scientific'));

// 联合早报
router.get('/zaobao/realtime/:type?', require('./routes/zaobao/realtime'));
router.get('/zaobao/znews/:type?', require('./routes/zaobao/znews'));

// Apple
router.get('/apple/exchange_repair/:country?', require('./routes/apple/exchange_repair'));

// Minecraft CurseForge
router.get('/curseforge/files/:project', require('./routes/curseforge/files'));

// 抖音
router.get('/douyin/user/:id', require('./routes/douyin/user'));

// 少数派 sspai
router.get('/sspai/series', require('./routes/sspai/series'));
router.get('/sspai/shortcuts', require('./routes/sspai/shortcutsGallery'));
router.get('/sspai/matrix', require('./routes/sspai/matrix'));

// xclient.info
router.get('/xclient/app/:name', require('./routes/xclient/app'));

// 中国驻外使领事馆
router.get('/embassy/:country/:city?', require('./routes/embassy/index'));

// 澎湃新闻
router.get('/thepaper/featured', require('./routes/thepaper/featured'));
router.get('/thepaper/channel/:id', require('./routes/thepaper/channel'));

// 电影首发站
router.get('/dysfz', require('./routes/dysfz/index'));
router.get('/dysfz/index', require('./routes/dysfz/index')); // 兼容

// きららファンタジア
router.get('/kirara/news', require('./routes/kirara/news'));

// 电影天堂
router.get('/dytt', require('./routes/dytt/index'));
router.get('/dytt/index', require('./routes/dytt/index')); // 兼容

// 趣头条
router.get('/qutoutiao/category/:cid', require('./routes/qutoutiao/category'));

// NHK NEW WEB EASY
router.get('/nhk/news_web_easy', require('./routes/nhk/news_web_easy'));

// BBC
router.get('/bbc/:channel?', require('./routes/bbc/index'));

// FT 中文网
router.get('/ft/:language/:channel?', require('./routes/ft/channel'));

// The Verge
router.get('/verge', require('./routes/verge/index'));

// 看雪
router.get('/pediy/topic/:category?/:type?', require('./routes/pediy/topic'));

// 观止（每日一文）
router.get('/guanzhi', require('./routes/guanzhi/guanzhi'));

// 多维新闻网
router.get('/dwnews/yaowen/:region?', require('./routes/dwnews/yaowen'));
router.get('/dwnews/rank/:type/:range', require('./routes/dwnews/rank'));

// 知晓程序
router.get('/miniapp/article/:category', require('./routes/miniapp/article'));
router.get('/miniapp/store/newest', require('./routes/miniapp/store/newest'));

// 后续
router.get('/houxu/:type/:id', require('./routes/houxu/houxu'));

// 老司机
router.get('/laosiji/hot', require('./routes/laosiji/hot'));
router.get('/laosiji/feed', require('./routes/laosiji/feed'));
router.get('/laosiji/hotshow/:id', require('./routes/laosiji/hotshow'));

// 99% Invisible
router.get('/99percentinvisible/transcript', require('./routes/99percentinvisible/transcript'));

// 青空文庫
router.get('/aozora/newbook/:count?', require('./routes/aozora/newbook'));

// solidot
router.get('/solidot/:type?', require('./routes/solidot/main'));

// Hermes UK
router.get('/parcel/hermesuk/:tracking', require('./routes/parcel/hermesuk'));

// 甩甩尾巴
router.get('/dgtle/trade/:typeId?', require('./routes/dgtle/trade'));

// 抽屉新热榜
router.get('/chouti/:subject?', require('./routes/chouti'));

// 西安电子科技大学
router.get('/xidian/jwc/:category?', require('./routes/universities/xidian/jwc'));

// Westore
router.get('/westore/new', require('./routes/westore/new'));

// 优酷
router.get('/youku/channel/:channelId/:embed?', require('./routes/youku/channel'));

// 油价
router.get('/oilprice/:area', require('./routes/oilprice'));

// nHentai
router.get('/nhentai/search/:keyword/:mode?', require('./routes/nhentai/search'));
router.get('/nhentai/:key/:keyword/:mode?', require('./routes/nhentai/other'));

// 龙腾网
router.get('/ltaaa/:type?', require('./routes/ltaaa/main'));

// AcFun
router.get('/acfun/bangumi/:id', require('./routes/acfun/bangumi'));

// Auto Trader
router.get('/autotrader/:query', require('./routes/autotrader'));

// 极客公园
router.get('/geekpark/breakingnews', require('./routes/geekpark/breakingnews'));

// 百度
router.get('/baidu/doodles', require('./routes/baidu/doodles'));
router.get('/baidu/topwords/:boardId?', require('./routes/baidu/topwords'));

// 搜狗
router.get('/sogou/doodles', require('./routes/sogou/doodles'));

// 香港天文台
router.get('/hko/weather', require('./routes/hko/weather'));

// sankakucomplex
router.get('/sankakucomplex/post', require('./routes/sankakucomplex/post'));

// 技术头条
router.get('/blogread/newest', require('./routes/blogread/newest'));

// gnn游戏新闻
router.get('/gnn/gnn', require('./routes/gnn/gnn'));

// a9vg游戏新闻
router.get('/a9vg/a9vg', require('./routes/a9vg/a9vg'));

// IT桔子
router.get('/itjuzi/invest', require('./routes/itjuzi/invest'));
router.get('/itjuzi/merge', require('./routes/itjuzi/merge'));

// 探物
router.get('/tanwu/products', require('./routes/tanwu/products'));

// GitChat
router.get('/gitchat/newest', require('./routes/gitchat/newest'));

// The Guardian
router.get('/guardian/:type', require('./routes/guardian/guardian'));

// 下厨房
router.get('/xiachufang/user/cooked/:id', require('./routes/xiachufang/user/cooked'));
router.get('/xiachufang/user/created/:id', require('./routes/xiachufang/user/created'));
router.get('/xiachufang/popular/:timeframe?', require('./routes/xiachufang/popular'));

// 经济观察报
router.get('/eeo/:category?', require('./routes/eeo/index'));

// 腾讯视频
router.get('/tencentvideo/playlist/:id', require('./routes/tencent/video/playlist'));

// 看漫画
router.get('/manhuagui/comic/:id', require('./routes/manhuagui/comic'));
// 動漫狂
router.get('/cartoonmad/comic/:id', require('./routes/cartoonmad/comic'));

// Tits Guru
router.get('/tits-guru/home', require('./routes/titsguru/home'));
router.get('/tits-guru/daily', require('./routes/titsguru/daily'));
router.get('/tits-guru/category/:type', require('./routes/titsguru/category'));
router.get('/tits-guru/model/:name', require('./routes/titsguru/model'));

// typora
router.get('/typora/changelog', require('./routes/typora/changelog'));

// TSSstatus
router.get('/tssstatus/:board/:build', require('./routes/tssstatus'));

// Anime1
router.get('/anime1/anime/:time/:name', require('./routes/anime1/anime'));
router.get('/anime1/search/:keyword', require('./routes/anime1/search'));

// gitea
router.get('/gitea/blog', require('./routes/gitea/blog'));

// iDownloadBlog
router.get('/idownloadblog', require('./routes/idownloadblog/index'));

// 9to5
router.get('/9to5/:type', require('./routes/9to5/subsite'));

// TesterHome
router.get('/testerhome/newest', require('./routes/testerhome/newest'));

// 刷屏
router.get('/weseepro/newest', require('./routes/weseepro/newest'));
router.get('/weseepro/circle', require('./routes/weseepro/circle'));

// 玩物志
router.get('/coolbuy/newest', require('./routes/coolbuy/newest'));

// NGA
router.get('/nga/forum/:fid', require('./routes/nga/forum'));
router.get('/nga/post/:tid', require('./routes/nga/post'));

// JavBus
router.get('/javbus/home', require('./routes/javbus/home'));
router.get('/javbus/genre/:gid', require('./routes/javbus/genre'));
router.get('/javbus/star/:sid', require('./routes/javbus/star'));
router.get('/javbus/uncensored/home', require('./routes/javbus/uncensored/home'));
router.get('/javbus/uncensored/genre/:gid', require('./routes/javbus/uncensored/genre'));
router.get('/javbus/uncensored/star/:sid', require('./routes/javbus/uncensored/star'));
router.get('/javbus/western/home', require('./routes/javbus/western/home'));
router.get('/javbus/western/genre/:gid', require('./routes/javbus/western/genre'));
router.get('/javbus/western/star/:sid', require('./routes/javbus/western/star'));

// 中山大学
router.get('/sysu/sdcs', require('./routes/universities/sysu/sdcs'));

// 動畫瘋
router.get('/anigamer/new_anime', require('./routes/anigamer/new_anime'));
router.get('/anigamer/anime/:sn', require('./routes/anigamer/anime'));

// Apkpure
router.get('/apkpure/versions/:region/:pkg', require('./routes/apkpure/versions'));

// 豆瓣美女
router.get('/dbmv/:category?', require('./routes/dbmv/index'));

// 中国药科大学
router.get('/cpu/home', require('./routes/cpu/home'));
router.get('/cpu/jwc', require('./routes/cpu/jwc'));
router.get('/cpu/yjsy', require('./routes/cpu/yjsy'));

// 字幕组
router.get('/zimuzu/resource/:id?', require('./routes/zimuzu/resource'));

// 虎嗅
router.get('/huxiu/tag/:id', require('./routes/huxiu/tag'));
router.get('/huxiu/search/:keyword', require('./routes/huxiu/search'));

// Steam
router.get('/steam/search/:params', require('./routes/steam/search'));
router.get('/steam/news/:appids', require('./routes/steam/news'));

// 扇贝
router.get('/shanbay/checkin/:id', require('./routes/shanbay/checkin'));

// Facebook
router.get('/facebook/page/:id', require('./routes/facebook/page'));

// 币乎
router.get('/bihu/activaties/:id', require('./routes/bihu/activaties'));

// 停电通知
router.get('/tingdiantz/95598/:orgNo/:provinceNo/:outageStartTime/:outageEndTime/:scope?', require('./routes/tingdiantz/95598'));
router.get('/tingdiantz/95598/:orgNo/:provinceNo/:scope?', require('./routes/tingdiantz/95598'));

// 36kr
router.get('/36kr/search/article/:keyword', require('./routes/36kr/search/article'));

// icourse163
router.get('/icourse163/newest', require('./routes/icourse163/newest'));

// patchwork.kernel.org
router.get('/patchwork.kernel.org/comments/:id', require('./routes/patchwork.kernel.org/comments'));

// qdaily
router.get('/qdaily', require('./routes/qdaily/index'));

// 京东众筹
router.get('/jingdong/zhongchou/:type/:status/:sort', require('./routes/jingdong/zhongchou'));

// 淘宝众筹
router.get('/taobao/zhongchou/:type?', require('./routes/taobao/zhongchou'));

// All Poetry
router.get('/allpoetry/:order?', require('./routes/allpoetry/order'));

// 华尔街见闻
router.get('/wallstreetcn/news/global', require('./routes/wallstreetcn/news'));

// 多抓鱼搜索
router.get('/duozhuayu/search/:wd', require('./routes/duozhuayu/search'));

// 创业邦
router.get('/cyzone/author/:id', require('./routes/cyzone/author'));

// 政府
router.get('/gov/zhengce/zuixin', require('./routes/gov/zhengce/zuixin'));

// 小黑盒
router.get('/xiaoheihe/user/:id', require('./routes/xiaoheihe/user'));

module.exports = router;
