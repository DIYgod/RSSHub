const Router = require('@koa/router');
const router = new Router();

const RouterHandlerMap = new Map();

// 懒加载 Route Handler，Route 首次被请求时才会 require 相关文件
const lazyloadRouteHandler = (routeHandlerPath) => (ctx) => {
    if (RouterHandlerMap.has(routeHandlerPath)) {
        return RouterHandlerMap.get(routeHandlerPath)(ctx);
    }

    const handler = require(routeHandlerPath);
    RouterHandlerMap.set(routeHandlerPath, handler);
    return handler(ctx);
};

// Deprecated: DO NOT ADD ANY NEW ROUTES HERE

// RSSHub migrated to v2
// router.get('/rsshub/rss', lazyloadRouteHandler('./routes/rsshub/routes')); // 弃用
// router.get('/rsshub/routes', lazyloadRouteHandler('./routes/rsshub/routes'));
// router.get('/rsshub/sponsors', lazyloadRouteHandler('./routes/rsshub/sponsors'));

// 1draw
router.get('/1draw', lazyloadRouteHandler('./routes/1draw/index'));

// quicker
// router.get('/quicker/qa', lazyloadRouteHandler('./routes/quicker/qa.js'));
// router.get('/quicker/update', lazyloadRouteHandler('./routes/quicker/update.js'));
// router.get('/quicker/user/action/:uid/:person', lazyloadRouteHandler('./routes/quicker/person.js'));
// router.get('/quicker/user/:uid/:person', lazyloadRouteHandler('./routes/quicker/person.js'));

// Benedict Evans
router.get('/benedictevans', lazyloadRouteHandler('./routes/benedictevans/recent.js'));

// bangumi
// router.get('/bangumi/calendar/today', lazyloadRouteHandler('./routes/bangumi/calendar/today'));
// router.get('/bangumi/subject/:id/:type', lazyloadRouteHandler('./routes/bangumi/subject'));
// router.get('/bangumi/person/:id', lazyloadRouteHandler('./routes/bangumi/person'));
// router.get('/bangumi/topic/:id', lazyloadRouteHandler('./routes/bangumi/group/reply'));
// router.get('/bangumi/group/:id', lazyloadRouteHandler('./routes/bangumi/group/topic'));
// router.get('/bangumi/subject/:id', lazyloadRouteHandler('./routes/bangumi/subject'));
// router.get('/bangumi/user/blog/:id', lazyloadRouteHandler('./routes/bangumi/user/blog'));

// 報導者 migrated to v2
// router.get('/twreporter/newest', lazyloadRouteHandler('./routes/twreporter/newest'));
// router.get('/twreporter/photography', lazyloadRouteHandler('./routes/twreporter/photography'));
// router.get('/twreporter/category/:cid', lazyloadRouteHandler('./routes/twreporter/category'));

// 微博 migrated to v2
// router.get('/weibo/user/:uid/:routeParams?', lazyloadRouteHandler('./routes/weibo/user'));
// router.get('/weibo/keyword/:keyword/:routeParams?', lazyloadRouteHandler('./routes/weibo/keyword'));
// router.get('/weibo/search/hot', lazyloadRouteHandler('./routes/weibo/search/hot'));
// router.get('/weibo/super_index/:id/:type?/:routeParams?', lazyloadRouteHandler('./routes/weibo/super_index'));
// router.get('/weibo/oasis/user/:userid', lazyloadRouteHandler('./routes/weibo/oasis/user'));

// 贴吧 migrated to v2
// router.get('/tieba/forum/:kw', lazyloadRouteHandler('./routes/tieba/forum'));
// router.get('/tieba/forum/good/:kw/:cid?', lazyloadRouteHandler('./routes/tieba/forum'));
// router.get('/tieba/post/:id', lazyloadRouteHandler('./routes/tieba/post'));
// router.get('/tieba/post/lz/:id', lazyloadRouteHandler('./routes/tieba/post'));
// router.get('/tieba/user/:uid', lazyloadRouteHandler('./routes/tieba/user'));

// 网易云音乐
// router.get('/ncm/playlist/:id', lazyloadRouteHandler('./routes/ncm/playlist'));
// router.get('/ncm/user/playlist/:uid', lazyloadRouteHandler('./routes/ncm/userplaylist'));
// router.get('/ncm/artist/:id', lazyloadRouteHandler('./routes/ncm/artist'));
// router.get('/ncm/djradio/:id', lazyloadRouteHandler('./routes/ncm/djradio'));
// router.get('/ncm/user/playrecords/:uid/:type?', lazyloadRouteHandler('./routes/ncm/userplayrecords'));

// 掘金 migrated to v2
// router.get('/juejin/category/:category', lazyloadRouteHandler('./routes/juejin/category'));
// router.get('/juejin/tag/:tag', lazyloadRouteHandler('./routes/juejin/tag'));
// router.get('/juejin/trending/:category/:type', lazyloadRouteHandler('./routes/juejin/trending'));
// router.get('/juejin/books', lazyloadRouteHandler('./routes/juejin/books'));
// router.get('/juejin/pins/:type?', lazyloadRouteHandler('./routes/juejin/pins'));
// router.get('/juejin/posts/:id', lazyloadRouteHandler('./routes/juejin/posts'));
// router.get('/juejin/news/:id', lazyloadRouteHandler('./routes/juejin/news'));
// router.get('/juejin/collections/:userId', lazyloadRouteHandler('./routes/juejin/favorites'));
// router.get('/juejin/collection/:collectionId', lazyloadRouteHandler('./routes/juejin/collection'));
// router.get('/juejin/shares/:userId', lazyloadRouteHandler('./routes/juejin/shares'));
// router.get('/juejin/column/:id', lazyloadRouteHandler('./routes/juejin/column'));

// 自如
router.get('/ziroom/room/:city/:iswhole/:room/:keyword', lazyloadRouteHandler('./routes/ziroom/room'));

// 简书
router.get('/jianshu/home', lazyloadRouteHandler('./routes/jianshu/home'));
router.get('/jianshu/trending/:timeframe', lazyloadRouteHandler('./routes/jianshu/trending'));
router.get('/jianshu/collection/:id', lazyloadRouteHandler('./routes/jianshu/collection'));
router.get('/jianshu/user/:id', lazyloadRouteHandler('./routes/jianshu/user'));

// 知乎 migrated to v2
// router.get('/zhihu/collection/:id/:getAll?', lazyloadRouteHandler('./routes/zhihu/collection'));
// router.get('/zhihu/people/activities/:id', lazyloadRouteHandler('./routes/zhihu/activities'));
// router.get('/zhihu/people/answers/:id', lazyloadRouteHandler('./routes/zhihu/answers'));
// router.get('/zhihu/posts/:usertype/:id', lazyloadRouteHandler('./routes/zhihu/posts'));
// router.get('/zhihu/zhuanlan/:id', lazyloadRouteHandler('./routes/zhihu/zhuanlan'));
// router.get('/zhihu/daily', lazyloadRouteHandler('./routes/zhihu/daily'));
// router.get('/zhihu/daily/section/:sectionId', lazyloadRouteHandler('./routes/zhihu/daily_section'));
// router.get('/zhihu/hotlist', lazyloadRouteHandler('./routes/zhihu/hotlist'));
// router.get('/zhihu/pin/hotlist', lazyloadRouteHandler('./routes/zhihu/pin/hotlist'));
// router.get('/zhihu/question/:questionId', lazyloadRouteHandler('./routes/zhihu/question'));
// router.get('/zhihu/topic/:topicId', lazyloadRouteHandler('./routes/zhihu/topic'));
// router.get('/zhihu/people/pins/:id', lazyloadRouteHandler('./routes/zhihu/pin/people'));
// router.get('/zhihu/bookstore/newest', lazyloadRouteHandler('./routes/zhihu/bookstore/newest'));
// router.get('/zhihu/pin/daily', lazyloadRouteHandler('./routes/zhihu/pin/daily'));
// router.get('/zhihu/weekly', lazyloadRouteHandler('./routes/zhihu/weekly'));
// router.get('/zhihu/timeline', lazyloadRouteHandler('./routes/zhihu/timeline'));
// router.get('/zhihu/hot/:category?', lazyloadRouteHandler('./routes/zhihu/hot'));

// 妹子图
router.get('/mzitu/home/:type?', lazyloadRouteHandler('./routes/mzitu/home'));
router.get('/mzitu/tags', lazyloadRouteHandler('./routes/mzitu/tags'));
router.get('/mzitu/category/:category', lazyloadRouteHandler('./routes/mzitu/category'));
router.get('/mzitu/post/:id', lazyloadRouteHandler('./routes/mzitu/post'));
router.get('/mzitu/tag/:tag', lazyloadRouteHandler('./routes/mzitu/tag'));

// pixiv migrated to v2
// router.get('/pixiv/user/bookmarks/:id', lazyloadRouteHandler('./routes/pixiv/bookmarks'));
// router.get('/pixiv/user/illustfollows', lazyloadRouteHandler('./routes/pixiv/illustfollow'));
// router.get('/pixiv/user/:id', lazyloadRouteHandler('./routes/pixiv/user'));
// router.get('/pixiv/ranking/:mode/:date?', lazyloadRouteHandler('./routes/pixiv/ranking'));
// router.get('/pixiv/search/:keyword/:order?/:mode?', lazyloadRouteHandler('./routes/pixiv/search'));

// pixiv-fanbox
router.get('/fanbox/:user?', lazyloadRouteHandler('./routes/fanbox/main'));

// 法律白話文運動
router.get('/plainlaw/archives', lazyloadRouteHandler('./routes/plainlaw/archives.js'));

// 煎蛋
// router.get('/jandan/article', lazyloadRouteHandler('./routes/jandan/article'));
// router.get('/jandan/:sub_model', lazyloadRouteHandler('./routes/jandan/pic'));

// 喷嚏
// router.get('/dapenti/tugua', lazyloadRouteHandler('./routes/dapenti/tugua'));
// router.get('/dapenti/subject/:id', lazyloadRouteHandler('./routes/dapenti/subject'));

// Dockone
router.get('/dockone/weekly', lazyloadRouteHandler('./routes/dockone/weekly'));

// 众成翻译
router.get('/zcfy', lazyloadRouteHandler('./routes/zcfy/index'));
router.get('/zcfy/index', lazyloadRouteHandler('./routes/zcfy/index')); // 废弃
router.get('/zcfy/hot', lazyloadRouteHandler('./routes/zcfy/hot'));

// 今日头条
router.get('/jinritoutiao/keyword/:keyword', lazyloadRouteHandler('./routes/jinritoutiao/keyword'));

// Disqus
router.get('/disqus/posts/:forum', lazyloadRouteHandler('./routes/disqus/posts'));

// Twitter
// router.get('/twitter/user/:id/:routeParams?', lazyloadRouteHandler('./routes/twitter/user'));
// router.get('/twitter/list/:id/:name/:routeParams?', lazyloadRouteHandler('./routes/twitter/list'));
// router.get('/twitter/likes/:id/:routeParams?', lazyloadRouteHandler('./routes/twitter/likes'));
// router.get('/twitter/followings/:id/:routeParams?', lazyloadRouteHandler('./routes/twitter/followings'));
// router.get('/twitter/keyword/:keyword/:routeParams?/:limit?', lazyloadRouteHandler('./routes/twitter/keyword'));
// router.get('/twitter/trends/:woeid?', lazyloadRouteHandler('./routes/twitter/trends'));
// router.get('/twitter/media/:id/:routeParams?', lazyloadRouteHandler('./routes/twitter/media'));

// YouTube migrated to v2
// router.get('/youtube/user/:username/:embed?', lazyloadRouteHandler('./routes/youtube/user'));
// router.get('/youtube/channel/:id/:embed?', lazyloadRouteHandler('./routes/youtube/channel'));
// router.get('/youtube/playlist/:id/:embed?', lazyloadRouteHandler('./routes/youtube/playlist'));

// 极客时间
router.get('/geektime/column/:cid', lazyloadRouteHandler('./routes/geektime/column'));
router.get('/geektime/news', lazyloadRouteHandler('./routes/geektime/news'));

// 界面新闻
// router.get('/jiemian/list/:cid', lazyloadRouteHandler('./routes/jiemian/list.js'));

// 好奇心日报
// router.get('/qdaily/:type/:id', lazyloadRouteHandler('./routes/qdaily/index'));

// 爱奇艺
// router.get('/iqiyi/dongman/:id', lazyloadRouteHandler('./routes/iqiyi/dongman'));
// router.get('/iqiyi/user/video/:uid', lazyloadRouteHandler('./routes/iqiyi/video'));

// 南方周末
router.get('/infzm/:id', lazyloadRouteHandler('./routes/infzm/news'));

// Dribbble
router.get('/dribbble/popular/:timeframe?', lazyloadRouteHandler('./routes/dribbble/popular'));
router.get('/dribbble/user/:name', lazyloadRouteHandler('./routes/dribbble/user'));
router.get('/dribbble/keyword/:keyword', lazyloadRouteHandler('./routes/dribbble/keyword'));

// 斗鱼
// router.get('/douyu/room/:id', lazyloadRouteHandler('./routes/douyu/room'));

// 虎牙
router.get('/huya/live/:id', lazyloadRouteHandler('./routes/huya/live'));

// 浪Play(原kingkong)直播
// router.get('/kingkong/room/:id', lazyloadRouteHandler('./routes/langlive/room'));
// router.get('/langlive/room/:id', lazyloadRouteHandler('./routes/langlive/room'));

// SHOWROOM直播
router.get('/showroom/room/:id', lazyloadRouteHandler('./routes/showroom/room'));

// v2ex
router.get('/v2ex/topics/:type', lazyloadRouteHandler('./routes/v2ex/topics'));
router.get('/v2ex/post/:postid', lazyloadRouteHandler('./routes/v2ex/post'));
router.get('/v2ex/tab/:tabid', lazyloadRouteHandler('./routes/v2ex/tab'));

// Readhub migrated to v2
// router.get('/readhub/category/:category?', lazyloadRouteHandler('./routes/readhub/index'));
// router.get('/readhub/:category?', lazyloadRouteHandler('./routes/readhub/index'));

// f-droid
router.get('/fdroid/apprelease/:app', lazyloadRouteHandler('./routes/fdroid/apprelease'));

// konachan
router.get('/konachan/post/popular_recent', lazyloadRouteHandler('./routes/konachan/post_popular_recent'));
router.get('/konachan.com/post/popular_recent', lazyloadRouteHandler('./routes/konachan/post_popular_recent'));
router.get('/konachan.net/post/popular_recent', lazyloadRouteHandler('./routes/konachan/post_popular_recent'));
router.get('/konachan/post/popular_recent/:period', lazyloadRouteHandler('./routes/konachan/post_popular_recent'));
router.get('/konachan.com/post/popular_recent/:period', lazyloadRouteHandler('./routes/konachan/post_popular_recent'));
router.get('/konachan.net/post/popular_recent/:period', lazyloadRouteHandler('./routes/konachan/post_popular_recent'));

// PornHub
router.get('/pornhub/category/:caty', lazyloadRouteHandler('./routes/pornhub/category'));
router.get('/pornhub/search/:keyword', lazyloadRouteHandler('./routes/pornhub/search'));
router.get('/pornhub/:language?/category_url/:url?', lazyloadRouteHandler('./routes/pornhub/category_url'));
router.get('/pornhub/:language?/users/:username', lazyloadRouteHandler('./routes/pornhub/users'));
router.get('/pornhub/:language?/model/:username/:sort?', lazyloadRouteHandler('./routes/pornhub/model'));
router.get('/pornhub/:language?/pornstar/:username/:sort?', lazyloadRouteHandler('./routes/pornhub/pornstar'));

// Prestige migrated to v2
// router.get('/prestige-av/series/:mid/:sort?', lazyloadRouteHandler('./routes/prestige-av/series'));

// yande.re
router.get('/yande.re/post/popular_recent', lazyloadRouteHandler('./routes/yande.re/post_popular_recent'));
router.get('/yande.re/post/popular_recent/:period', lazyloadRouteHandler('./routes/yande.re/post_popular_recent'));

// 纽约时报 migrated to v2
// router.get('/nytimes/daily_briefing_chinese', lazyloadRouteHandler('./routes/nytimes/daily_briefing_chinese'));
// router.get('/nytimes/book/:category?', lazyloadRouteHandler('./routes/nytimes/book.js'));
// router.get('/nytimes/author/:byline', lazyloadRouteHandler('./routes/nytimes/author.js'));
// router.get('/nytimes/:lang?', lazyloadRouteHandler('./routes/nytimes/index'));

// 3dm
router.get('/3dm/:name/:type', lazyloadRouteHandler('./routes/3dm/game'));
router.get('/3dm/news', lazyloadRouteHandler('./routes/3dm/news_center'));

// 喜马拉雅
router.get('/ximalaya/:type/:id/:all?', lazyloadRouteHandler('./routes/ximalaya/album'));
router.get('/ximalaya/:type/:id/:all/:shownote?', lazyloadRouteHandler('./routes/ximalaya/album'));

// EZTV
router.get('/eztv/torrents/:imdb_id', lazyloadRouteHandler('./routes/eztv/imdb'));

// 什么值得买
// router.get('/smzdm/keyword/:keyword', lazyloadRouteHandler('./routes/smzdm/keyword'));
// router.get('/smzdm/ranking/:rank_type/:rank_id/:hour', lazyloadRouteHandler('./routes/smzdm/ranking'));
// router.get('/smzdm/haowen/:day?', lazyloadRouteHandler('./routes/smzdm/haowen'));
// router.get('/smzdm/haowen/fenlei/:name/:sort?', lazyloadRouteHandler('./routes/smzdm/haowen_fenlei'));
// router.get('/smzdm/article/:uid', lazyloadRouteHandler('./routes/smzdm/article'));
// router.get('/smzdm/baoliao/:uid', lazyloadRouteHandler('./routes/smzdm/baoliao'));

// 新京报
router.get('/bjnews/:cat', lazyloadRouteHandler('./routes/bjnews/news'));
router.get('/bjnews/epaper/:cat', lazyloadRouteHandler('./routes/bjnews/epaper'));

// 停水通知 migrated to v2
// router.get('/tingshuitz/hangzhou', lazyloadRouteHandler('./routes/tingshuitz/hangzhou'));
// router.get('/tingshuitz/xiaoshan', lazyloadRouteHandler('./routes/tingshuitz/xiaoshan'));
// router.get('/tingshuitz/dalian', lazyloadRouteHandler('./routes/tingshuitz/dalian'));
// router.get('/tingshuitz/guangzhou', lazyloadRouteHandler('./routes/tingshuitz/guangzhou'));
// router.get('/tingshuitz/dongguan', lazyloadRouteHandler('./routes/tingshuitz/dongguan'));
// router.get('/tingshuitz/xian', lazyloadRouteHandler('./routes/tingshuitz/xian'));
// router.get('/tingshuitz/yangjiang', lazyloadRouteHandler('./routes/tingshuitz/yangjiang'));
// router.get('/tingshuitz/nanjing', lazyloadRouteHandler('./routes/tingshuitz/nanjing'));
// router.get('/tingshuitz/wuhan', lazyloadRouteHandler('./routes/tingshuitz/wuhan'));

// 米哈游
router.get('/mihoyo/bh3/:type', lazyloadRouteHandler('./routes/mihoyo/bh3'));
router.get('/mihoyo/bh2/:type', lazyloadRouteHandler('./routes/mihoyo/bh2'));

// 新闻联播 migrated to v2
// router.get('/cctv/xwlb', lazyloadRouteHandler('./routes/cctv/xwlb'));
// 央视新闻
// router.get('/cctv/lm/:id?', lazyloadRouteHandler('./routes/cctv/lm'));
// router.get('/cctv/:category', lazyloadRouteHandler('./routes/cctv/category'));
// router.get('/cctv/photo/jx', lazyloadRouteHandler('./routes/cctv/jx'));
// router.get('/cctv-special/:id?', lazyloadRouteHandler('./routes/cctv/special'));

// 财新博客
// router.get('/caixin/blog/:column', lazyloadRouteHandler('./routes/caixin/blog'));
// router.get('/caixin/article', lazyloadRouteHandler('./routes/caixin/article'));
// router.get('/caixin/database', lazyloadRouteHandler('./routes/caixin/database'));
// router.get('/caixin/yxnews', lazyloadRouteHandler('./routes/caixin/yxnews'));
// router.get('/caixin/:column/:category', lazyloadRouteHandler('./routes/caixin/category'));

// 草榴社区
router.get('/t66y/post/:tid', lazyloadRouteHandler('./routes/t66y/post'));
router.get('/t66y/:id/:type?', lazyloadRouteHandler('./routes/t66y/index'));

// 色中色
router.get('/sexinsex/:id/:type?', lazyloadRouteHandler('./routes/sexinsex/index'));

// 国家地理 migrated to v2
// router.get('/natgeo/dailyselection', lazyloadRouteHandler('./routes/natgeo/dailyselection'));
// router.get('/natgeo/dailyphoto', lazyloadRouteHandler('./routes/natgeo/dailyphoto'));
// router.get('/natgeo/:cat/:type?', lazyloadRouteHandler('./routes/natgeo/natgeo'));

// 一个
router.get('/one', lazyloadRouteHandler('./routes/one/index'));

// Firefox
router.get('/firefox/release/:platform', lazyloadRouteHandler('./routes/firefox/release'));
router.get('/firefox/addons/:id', lazyloadRouteHandler('./routes/firefox/addons'));

// Thunderbird
router.get('/thunderbird/release', lazyloadRouteHandler('./routes/thunderbird/release'));

// tuicool
router.get('/tuicool/mags/:type', lazyloadRouteHandler('./routes/tuicool/mags'));

// Hexo
router.get('/hexo/next/:url', lazyloadRouteHandler('./routes/hexo/next'));
router.get('/hexo/yilia/:url', lazyloadRouteHandler('./routes/hexo/yilia'));
router.get('/hexo/fluid/:url', lazyloadRouteHandler('./routes/hexo/fluid'));

// cpython
router.get('/cpython/:pre?', lazyloadRouteHandler('./routes/cpython'));

// 小米
router.get('/mi/golden', lazyloadRouteHandler('./routes/mi/golden'));
router.get('/mi/crowdfunding', lazyloadRouteHandler('./routes/mi/crowdfunding'));
// router.get('/mi/youpin/crowdfunding', lazyloadRouteHandler('./routes/mi/youpin/crowdfunding'));
// router.get('/mi/youpin/new/:sort?', lazyloadRouteHandler('./routes/mi/youpin/new'));
router.get('/miui/:device/:type?/:region?', lazyloadRouteHandler('./routes/mi/miui/index'));
router.get('/mi/bbs/board/:boardId', lazyloadRouteHandler('./routes/mi/board'));

// Keep
// router.get('/keep/user/:id', lazyloadRouteHandler('./routes/keep/user'));

// 起点 migrated to v2
// router.get('/qidian/chapter/:id', lazyloadRouteHandler('./routes/qidian/chapter'));
// router.get('/qidian/forum/:id', lazyloadRouteHandler('./routes/qidian/forum'));
// router.get('/qidian/free/:type?', lazyloadRouteHandler('./routes/qidian/free'));
// router.get('/qidian/free-next/:type?', lazyloadRouteHandler('./routes/qidian/free-next'));

// 纵横
router.get('/zongheng/chapter/:id', lazyloadRouteHandler('./routes/zongheng/chapter'));

// 刺猬猫
router.get('/ciweimao/chapter/:id', lazyloadRouteHandler('./routes/ciweimao/chapter'));

// 中国美术馆
router.get('/namoc/announcement', lazyloadRouteHandler('./routes/namoc/announcement'));
router.get('/namoc/news', lazyloadRouteHandler('./routes/namoc/news'));
router.get('/namoc/media', lazyloadRouteHandler('./routes/namoc/media'));
router.get('/namoc/exhibition', lazyloadRouteHandler('./routes/namoc/exhibition'));
router.get('/namoc/specials', lazyloadRouteHandler('./routes/namoc/specials'));

// 懂球帝 migrated to v2
// router.get('/dongqiudi/daily', lazyloadRouteHandler('./routes/dongqiudi/daily'));
// router.get('/dongqiudi/result/:team', lazyloadRouteHandler('./routes/dongqiudi/result'));
// router.get('/dongqiudi/team_news/:team', lazyloadRouteHandler('./routes/dongqiudi/team_news'));
// router.get('/dongqiudi/player_news/:id', lazyloadRouteHandler('./routes/dongqiudi/player_news'));
// router.get('/dongqiudi/special/:id', lazyloadRouteHandler('./routes/dongqiudi/special'));
// router.get('/dongqiudi/top_news/:id?', lazyloadRouteHandler('./routes/dongqiudi/top_news'));

// 维基百科 Wikipedia
router.get('/wikipedia/mainland', lazyloadRouteHandler('./routes/wikipedia/mainland'));

// 联合国 United Nations
router.get('/un/scveto', lazyloadRouteHandler('./routes/un/scveto'));

// e 公司
router.get('/egsea/flash', lazyloadRouteHandler('./routes/egsea/flash'));

// 选股宝
router.get('/xuangubao/subject/:subject_id', lazyloadRouteHandler('./routes/xuangubao/subject'));

// 雪球 migrated to v2
// router.get('/xueqiu/user/:id/:type?', lazyloadRouteHandler('./routes/xueqiu/user'));
// router.get('/xueqiu/favorite/:id', lazyloadRouteHandler('./routes/xueqiu/favorite'));
// router.get('/xueqiu/user_stock/:id', lazyloadRouteHandler('./routes/xueqiu/user_stock'));
// router.get('/xueqiu/fund/:id', lazyloadRouteHandler('./routes/xueqiu/fund'));
// router.get('/xueqiu/stock_info/:id/:type?', lazyloadRouteHandler('./routes/xueqiu/stock_info'));
// router.get('/xueqiu/snb/:id', lazyloadRouteHandler('./routes/xueqiu/snb'));
// router.get('/xueqiu/hots', lazyloadRouteHandler('./routes/xueqiu/hots'));
// router.get('/xueqiu/stock_comments/:id/:titleLength?', lazyloadRouteHandler('./routes/xueqiu/stock_comments'));

// Greasy Fork migrated to v2
// router.get('/greasyfork/:language/:domain?', lazyloadRouteHandler('./routes/greasyfork/scripts'));

// Gwern Bran­wen
router.get('/gwern/:category', lazyloadRouteHandler('./routes/gwern/category'));

// LinkedKeeper
router.get('/linkedkeeper/:type/:id?', lazyloadRouteHandler('./routes/linkedkeeper/index'));

// 开源中国 migrated to v2
// router.get('/oschina/news/:category?', lazyloadRouteHandler('./routes/oschina/news'));
// router.get('/oschina/user/:id', lazyloadRouteHandler('./routes/oschina/user'));
// router.get('/oschina/u/:id', lazyloadRouteHandler('./routes/oschina/u'));
// router.get('/oschina/topic/:topic', lazyloadRouteHandler('./routes/oschina/topic'));

// MIT Technology Review
router.get('/technologyreview', lazyloadRouteHandler('./routes/technologyreview/index'));
router.get('/technologyreview/:category_name', lazyloadRouteHandler('./routes/technologyreview/topic'));

// 安全客
// router.get('/aqk/vul', lazyloadRouteHandler('./routes/aqk/vul'));
// router.get('/aqk/:category', lazyloadRouteHandler('./routes/aqk/category'));

// 腾讯游戏开发者社区
router.get('/gameinstitute/community/:tag?', lazyloadRouteHandler('./routes/tencent/gameinstitute/community'));

// 腾讯视频 SDK
router.get('/qcloud/mlvb/changelog', lazyloadRouteHandler('./routes/tencent/qcloud/mlvb/changelog'));

// 腾讯吐个槽
router.get('/tucaoqq/post/:project/:key', lazyloadRouteHandler('./routes/tencent/tucaoqq/post'));

// Bugly SDK
router.get('/bugly/changelog/:platform', lazyloadRouteHandler('./routes/tencent/bugly/changelog'));

// wechat migrated to v2
// router.get('/wechat/wemp/:id', lazyloadRouteHandler('./routes/tencent/wechat/wemp'));
// router.get('/wechat/ce/:id', lazyloadRouteHandler('./routes/tencent/wechat/ce'));
// router.get('/wechat/announce', lazyloadRouteHandler('./routes/tencent/wechat/announce'));
router.get('/wechat/miniprogram/plugins', lazyloadRouteHandler('./routes/tencent/wechat/miniprogram/plugins'));
// router.get('/wechat/tgchannel/:id/:mpName?/:searchQueryType?', lazyloadRouteHandler('./routes/tencent/wechat/tgchannel'));
// router.get('/wechat/uread/:userid', lazyloadRouteHandler('./routes/tencent/wechat/uread'));
// router.get('/wechat/ershicimi/:id', lazyloadRouteHandler('./routes/tencent/wechat/ershcimi'));
// router.get('/wechat/wxnmh/:id', lazyloadRouteHandler('./routes/tencent/wechat/wxnmh'));
// router.get('/wechat/mp/homepage/:biz/:hid/:cid?', lazyloadRouteHandler('./routes/tencent/wechat/mp'));
// router.get('/wechat/mp/msgalbum/:biz/:aid', lazyloadRouteHandler('./routes/tencent/wechat/msgalbum'));
// router.get('/wechat/feeds/:id', lazyloadRouteHandler('./routes/tencent/wechat/feeds'));

// All the Flight Deals
router.get('/atfd/:locations/:nearby?', lazyloadRouteHandler('./routes/atfd/index'));

// Fir
router.get('/fir/update/:id', lazyloadRouteHandler('./routes/fir/update'));

// Nvidia Web Driver
router.get('/nvidia/webdriverupdate', lazyloadRouteHandler('./routes/nvidia/webdriverupdate'));

// 每日环球展览 iMuseum
router.get('/imuseum/:city/:type?', lazyloadRouteHandler('./routes/imuseum'));

// Hopper
router.get('/hopper/:lowestOnly/:from/:to?', lazyloadRouteHandler('./routes/hopper/index'));

// 马蜂窝
router.get('/mafengwo/note/:type', lazyloadRouteHandler('./routes/mafengwo/note'));
router.get('/mafengwo/ziyouxing/:code', lazyloadRouteHandler('./routes/mafengwo/ziyouxing'));

// 中国地震局震情速递（与地震台网同步更新）migrated to v2
// router.get('/earthquake/:region?', lazyloadRouteHandler('./routes/earthquake'));
// 中国地震台网
// router.get('/earthquake/ceic/:type', lazyloadRouteHandler('./routes/earthquake/ceic'));

// 小说
// router.get('/novel/biquge/:id', lazyloadRouteHandler('./routes/novel/biquge'));
// router.get('/novel/biqugeinfo/:id/:limit?', lazyloadRouteHandler('./routes/novel/biqugeinfo'));
router.get('/novel/uukanshu/:uid', lazyloadRouteHandler('./routes/novel/uukanshu'));
router.get('/novel/wenxuemi/:id1/:id2', lazyloadRouteHandler('./routes/novel/wenxuemi'));
router.get('/novel/booksky/:id', lazyloadRouteHandler('./routes/novel/booksky'));
router.get('/novel/ptwxz/:id1/:id2', lazyloadRouteHandler('./routes/novel/ptwxz'));
router.get('/novel/zhaishuyuan/:id', lazyloadRouteHandler('./routes/novel/zhaishuyuan'));

// 中国气象网
router.get('/weatheralarm/:province?', lazyloadRouteHandler('./routes/weatheralarm'));

// Gitlab
router.get('/gitlab/explore/:type/:host?', lazyloadRouteHandler('./routes/gitlab/explore'));
router.get('/gitlab/release/:namespace/:project/:host?', lazyloadRouteHandler('./routes/gitlab/release'));
router.get('/gitlab/tag/:namespace/:project/:host?', lazyloadRouteHandler('./routes/gitlab/tag'));

// 忧郁的loli
router.get('/mygalgame', lazyloadRouteHandler('./routes/galgame/hhgal')); // 废弃
router.get('/mmgal', lazyloadRouteHandler('./routes/galgame/hhgal')); // 废弃
router.get('/hhgal', lazyloadRouteHandler('./routes/galgame/hhgal'));

// say花火
router.get('/sayhuahuo', lazyloadRouteHandler('./routes/galgame/sayhuahuo'));

// 终点分享
router.get('/zdfx', lazyloadRouteHandler('./routes/galgame/zdfx'));

// 北京林业大学 migrated to v2
// router.get('/bjfu/grs', lazyloadRouteHandler('./routes/universities/bjfu/grs'));
// router.get('/bjfu/kjc', lazyloadRouteHandler('./routes/universities/bjfu/kjc'));
// router.get('/bjfu/jwc/:type', lazyloadRouteHandler('./routes/universities/bjfu/jwc/index'));
// router.get('/bjfu/news/:type', lazyloadRouteHandler('./routes/universities/bjfu/news/index'));
// router.get('/bjfu/it/:type', lazyloadRouteHandler('./routes/universities/bjfu/it/index'));

// 北京理工大学
router.get('/bit/jwc', lazyloadRouteHandler('./routes/universities/bit/jwc/jwc'));
router.get('/bit/cs', lazyloadRouteHandler('./routes/universities/bit/cs/cs'));

// 北京交通大学
router.get('/bjtu/gs/:type', lazyloadRouteHandler('./routes/universities/bjtu/gs'));

// 大连工业大学
router.get('/dpu/jiaowu/news/:type?', lazyloadRouteHandler('./routes/universities/dpu/jiaowu/news'));
router.get('/dpu/wlfw/news/:type?', lazyloadRouteHandler('./routes/universities/dpu/wlfw/news'));

// 大连理工大学
// router.get('/dut/:subsite/:type', lazyloadRouteHandler('./routes/universities/dut/index'));

// 东南大学
router.get('/seu/radio/academic', lazyloadRouteHandler('./routes/universities/seu/radio/academic'));
router.get('/seu/yzb/:type', lazyloadRouteHandler('./routes/universities/seu/yzb'));
router.get('/seu/cse/:type?', lazyloadRouteHandler('./routes/universities/seu/cse'));

// 南京工业大学
router.get('/njtech/jwc', lazyloadRouteHandler('./routes/universities/njtech/jwc'));

// 南京航空航天大学 migrated to v2
// router.get('/nuaa/jwc/:type/:getDescription?', lazyloadRouteHandler('./routes/universities/nuaa/jwc/jwc'));
// router.get('/nuaa/cs/:type/:getDescription?', lazyloadRouteHandler('./routes/universities/nuaa/cs/index'));
// router.get('/nuaa/yjsy/:type?', lazyloadRouteHandler('./routes/universities/nuaa/yjsy/yjsy'));

// 河海大学
router.get('/hhu/libNews', lazyloadRouteHandler('./routes/universities/hhu/libNews'));
// 河海大学常州校区
router.get('/hhu/libNewsc', lazyloadRouteHandler('./routes/universities/hhu/libNewsc'));

// 哈尔滨工业大学 migrated to v2
// router.get('/hit/jwc', lazyloadRouteHandler('./routes/universities/hit/jwc'));
// router.get('/hit/today/:category', lazyloadRouteHandler('./routes/universities/hit/today'));

// 哈尔滨工业大学（深圳）
// router.get('/hitsz/article/:category?', lazyloadRouteHandler('./routes/universities/hitsz/article'));

// 哈尔滨工业大学（威海）
// router.get('/hitwh/today', lazyloadRouteHandler('./routes/universities/hitwh/today'));

// 上海科技大学
router.get('/shanghaitech/activity', lazyloadRouteHandler('./routes/universities/shanghaitech/activity'));
router.get('/shanghaitech/sist/activity', lazyloadRouteHandler('./routes/universities/shanghaitech/sist/activity'));

// 上海交通大学
router.get('/sjtu/seiee/academic', lazyloadRouteHandler('./routes/universities/sjtu/seiee/academic'));
router.get('/sjtu/seiee/bjwb/:type', lazyloadRouteHandler('./routes/universities/sjtu/seiee/bjwb'));
router.get('/sjtu/seiee/xsb/:type?', lazyloadRouteHandler('./routes/universities/sjtu/seiee/xsb'));

router.get('/sjtu/gs/tzgg/:type?', lazyloadRouteHandler('./routes/universities/sjtu/gs/tzgg'));
router.get('/sjtu/jwc/:type?', lazyloadRouteHandler('./routes/universities/sjtu/jwc'));
router.get('/sjtu/tongqu/:type?', lazyloadRouteHandler('./routes/universities/sjtu/tongqu/activity'));
router.get('/sjtu/yzb/zkxx/:type', lazyloadRouteHandler('./routes/universities/sjtu/yzb/zkxx'));

// 江南大学
router.get('/ju/jwc/:type?', lazyloadRouteHandler('./routes/universities/ju/jwc'));

// 洛阳理工学院
router.get('/lit/jwc', lazyloadRouteHandler('./routes/universities/lit/jwc'));
router.get('/lit/xwzx/:name?', lazyloadRouteHandler('./routes/universities/lit/xwzx'));
router.get('/lit/tw/:name?', lazyloadRouteHandler('./routes/universities/lit/tw'));

// 清华大学
router.get('/thu/career', lazyloadRouteHandler('./routes/universities/thu/career'));
router.get('/thu/:type', lazyloadRouteHandler('./routes/universities/thu/index'));

// 北京大学 migrated to v2
// router.get('/pku/eecs/:type?', lazyloadRouteHandler('./routes/universities/pku/eecs'));
// router.get('/pku/rccp/mzyt', lazyloadRouteHandler('./routes/universities/pku/rccp/mzyt'));
// router.get('/pku/cls/lecture', lazyloadRouteHandler('./routes/universities/pku/cls/lecture'));
// router.get('/pku/bbs/hot', lazyloadRouteHandler('./routes/universities/pku/bbs/hot'));
// router.get('/pku/scc/recruit/:type?', lazyloadRouteHandler('./routes/universities/pku/scc/recruit'));

// 上海海事大学 migrated to v2
// router.get('/shmtu/www/:type', lazyloadRouteHandler('./routes/universities/shmtu/www'));
// router.get('/shmtu/jwc/:type', lazyloadRouteHandler('./routes/universities/shmtu/jwc'));

// 上海海洋大学
router.get('/shou/www/:type', lazyloadRouteHandler('./routes/universities/shou/www'));

// 西南科技大学
router.get('/swust/jwc/news', lazyloadRouteHandler('./routes/universities/swust/jwc_news'));
router.get('/swust/jwc/notice/:type?', lazyloadRouteHandler('./routes/universities/swust/jwc_notice'));
router.get('/swust/cs/:type?', lazyloadRouteHandler('./routes/universities/swust/cs'));

// 华南师范大学
router.get('/scnu/jw', lazyloadRouteHandler('./routes/universities/scnu/jw'));
router.get('/scnu/library', lazyloadRouteHandler('./routes/universities/scnu/library'));
router.get('/scnu/cs/match', lazyloadRouteHandler('./routes/universities/scnu/cs/match'));

// 广东工业大学
// router.get('/gdut/news', lazyloadRouteHandler('./routes/universities/gdut/news'));

// 中国科学院
// router.get('/cas/sim/academic', lazyloadRouteHandler('./routes/universities/cas/sim/academic'));
// router.get('/cas/mesalab/kb', lazyloadRouteHandler('./routes/universities/cas/mesalab/kb'));
// router.get('/cas/iee/kydt', lazyloadRouteHandler('./routes/universities/cas/iee/kydt'));
// router.get('/cas/cg/:caty?', lazyloadRouteHandler('./routes/universities/cas/cg/index'));

// 中国传媒大学
// router.get('/cuc/yz', lazyloadRouteHandler('./v2/cuc/yz'));

// UTdallas ISSO
router.get('/utdallas/isso', lazyloadRouteHandler('./routes/universities/utdallas/isso'));

// 南昌航空大学
router.get('/nchu/jwc/:type?', lazyloadRouteHandler('./routes/universities/nchu/jwc'));

// 重庆大学
router.get('/cqu/jwc/:path*', lazyloadRouteHandler('./routes/universities/cqu/jwc/announcement'));
router.get('/cqu/news/jzyg', lazyloadRouteHandler('./routes/universities/cqu/news/jzyg'));
router.get('/cqu/news/tz', lazyloadRouteHandler('./routes/universities/cqu/news/tz'));
router.get('/cqu/youth/:category', lazyloadRouteHandler('./routes/universities/cqu/youth/info'));
router.get('/cqu/sci/:category', lazyloadRouteHandler('./routes/universities/cqu/sci/info'));
router.get('/cqu/net/:category', lazyloadRouteHandler('./routes/universities/cqu/net/info'));

// 南京信息工程大学
// router.get('/nuist/bulletin/:category?', lazyloadRouteHandler('./routes/universities/nuist/bulletin'));
// router.get('/nuist/jwc/:category?', lazyloadRouteHandler('./routes/universities/nuist/jwc'));
// router.get('/nuist/yjs/:category?', lazyloadRouteHandler('./routes/universities/nuist/yjs'));
// router.get('/nuist/xgc', lazyloadRouteHandler('./routes/universities/nuist/xgc'));
// router.get('/nuist/scs/:category?', lazyloadRouteHandler('./routes/universities/nuist/scs'));
// router.get('/nuist/lib', lazyloadRouteHandler('./routes/universities/nuist/library/lib'));
// router.get('/nuist/sese/:category?', lazyloadRouteHandler('./routes/universities/nuist/sese'));
// router.get('/nuist/cas/:category?', lazyloadRouteHandler('./routes/universities/nuist/cas'));

// 成都信息工程大学
router.get('/cuit/cxxww/:type?', lazyloadRouteHandler('./routes/universities/cuit/cxxww'));

// 郑州大学
router.get('/zzu/news/:type', lazyloadRouteHandler('./routes/universities/zzu/news'));
router.get('/zzu/soft/news/:type', lazyloadRouteHandler('./routes/universities/zzu/soft/news'));

// 郑州轻工业大学
router.get('/zzuli/campus/:type', lazyloadRouteHandler('./routes/universities/zzuli/campus'));
router.get('/zzuli/yjsc/:type', lazyloadRouteHandler('./routes/universities/zzuli/yjsc'));

// 重庆科技学院
router.get('/cqust/jw/:type?', lazyloadRouteHandler('./routes/universities/cqust/jw'));
router.get('/cqust/lib/:type?', lazyloadRouteHandler('./routes/universities/cqust/lib'));

// 常州大学
router.get('/cczu/jwc/:category?', lazyloadRouteHandler('./routes/universities/cczu/jwc'));
router.get('/cczu/news/:category?', lazyloadRouteHandler('./routes/universities/cczu/news'));

// 四川旅游学院
router.get('/sctu/xgxy', lazyloadRouteHandler('./routes/universities/sctu/information-engineer-faculty/index'));
router.get('/sctu/xgxy/:id', lazyloadRouteHandler('./routes/universities/sctu/information-engineer-faculty/context'));
router.get('/sctu/jwc/:type?', lazyloadRouteHandler('./routes/universities/sctu/jwc/index'));
router.get('/sctu/jwc/:type/:id', lazyloadRouteHandler('./routes/universities/sctu/jwc/context'));

// 电子科技大学
router.get('/uestc/jwc/:type?', lazyloadRouteHandler('./routes/universities/uestc/jwc'));
router.get('/uestc/is/:type?', lazyloadRouteHandler('./routes/universities/uestc/is'));
router.get('/uestc/news/:type?', lazyloadRouteHandler('./routes/universities/uestc/news'));
router.get('/uestc/auto/:type?', lazyloadRouteHandler('./routes/universities/uestc/auto'));
router.get('/uestc/cs/:type?', lazyloadRouteHandler('./routes/universities/uestc/cs'));
router.get('/uestc/cqe/:type?', lazyloadRouteHandler('./routes/universities/uestc/cqe'));
router.get('/uestc/gr', lazyloadRouteHandler('./routes/universities/uestc/gr'));
router.get('/uestc/sice', lazyloadRouteHandler('./routes/universities/uestc/sice'));

// 西北农林科技大学
router.get('/nwafu/news', lazyloadRouteHandler('./routes/universities/nwafu/news'));
router.get('/nwafu/jiaowu', lazyloadRouteHandler('./routes/universities/nwafu/jiaowu'));
router.get('/nwafu/gs', lazyloadRouteHandler('./routes/universities/nwafu/gs'));
router.get('/nwafu/lib', lazyloadRouteHandler('./routes/universities/nwafu/lib'));
router.get('/nwafu/nic', lazyloadRouteHandler('./routes/universities/nwafu/nic'));
router.get('/nwafu/54youth', lazyloadRouteHandler('./routes/universities/nwafu/54youth'));
router.get('/nwafu/jcc', lazyloadRouteHandler('./routes/universities/nwafu/jcc'));
router.get('/nwafu/yjshy', lazyloadRouteHandler('./routes/universities/nwafu/yjshy'));
router.get('/nwafu/cie', lazyloadRouteHandler('./routes/universities/nwafu/cie'));

// 云南大学
router.get('/ynu/grs/zytz', lazyloadRouteHandler('./routes/universities/ynu/grs/zytz'));
router.get('/ynu/grs/qttz/:category', lazyloadRouteHandler('./routes/universities/ynu/grs/qttz'));
router.get('/ynu/jwc/:category', lazyloadRouteHandler('./routes/universities/ynu/jwc/zytz'));
router.get('/ynu/home', lazyloadRouteHandler('./routes/universities/ynu/home/main'));

// 云南师范大学
router.get('/ynnu/edu/news', lazyloadRouteHandler('./routes/universities/ynnu/edu/news'));

// 昆明理工大学
router.get('/kmust/jwc/:type?', lazyloadRouteHandler('./routes/universities/kmust/jwc'));
router.get('/kmust/job/careers/:type?', lazyloadRouteHandler('./routes/universities/kmust/job/careers'));
router.get('/kmust/job/jobfairs', lazyloadRouteHandler('./routes/universities/kmust/job/jobfairs'));

// 武汉大学
router.get('/whu/cs/:type', lazyloadRouteHandler('./routes/universities/whu/cs'));
router.get('/whu/news/:type?', lazyloadRouteHandler('./routes/universities/whu/news'));

// 潍坊学院 migrated to v2
// router.get('/wfu/news/:type?', require('./routes/universities/wfu/news'));
// router.get('/wfu/jwc', require('./routes/universities/wfu/jwc'));

// 华中科技大学
router.get('/hust/auto/notice/:type?', lazyloadRouteHandler('./routes/universities/hust/aia/notice'));
router.get('/hust/auto/news', lazyloadRouteHandler('./routes/universities/hust/aia/news'));
router.get('/hust/aia/news', lazyloadRouteHandler('./routes/universities/hust/aia/news'));
router.get('/hust/aia/notice/:type?', lazyloadRouteHandler('./routes/universities/hust/aia/notice'));

// 井冈山大学
router.get('/jgsu/jwc', lazyloadRouteHandler('./routes/universities/jgsu/jwc'));

// 山东大学 migrated to v2
// router.get('/sdu/sc/:type?', lazyloadRouteHandler('./routes/universities/sdu/sc'));
// router.get('/sdu/cs/:type?', lazyloadRouteHandler('./routes/universities/sdu/cs'));
// router.get('/sdu/cmse/:type?', lazyloadRouteHandler('./routes/universities/sdu/cmse'));
// router.get('/sdu/mech/:type?', lazyloadRouteHandler('./routes/universities/sdu/mech'));
// router.get('/sdu/epe/:type?', lazyloadRouteHandler('./routes/universities/sdu/epe'));

// 中国海洋大学
router.get('/ouc/it/:type?', lazyloadRouteHandler('./routes/universities/ouc/it'));

// 大连大学
router.get('/dlu/jiaowu/news', lazyloadRouteHandler('./routes/universities/dlu/jiaowu/news'));

// 东莞理工学院
router.get('/dgut/jwc/:type?', lazyloadRouteHandler('./routes/universities/dgut/jwc'));
router.get('/dgut/xsc/:type?', lazyloadRouteHandler('./routes/universities/dgut/xsc'));

// 同济大学
router.get('/tju/sse/:type?', lazyloadRouteHandler('./routes/universities/tju/sse/notice'));

// 华南理工大学
router.get('/scut/jwc/notice/:category?', lazyloadRouteHandler('./routes/universities/scut/jwc/notice'));
router.get('/scut/jwc/school/:category?', lazyloadRouteHandler('./routes/universities/scut/jwc/school'));
router.get('/scut/jwc/news', lazyloadRouteHandler('./routes/universities/scut/jwc/news'));

// 温州商学院
router.get('/wzbc/:type?', lazyloadRouteHandler('./routes/universities/wzbc/news'));

// 河南大学
router.get('/henu/:type?', lazyloadRouteHandler('./routes/universities/henu/news'));

// 天津大学 migrated to v2
// router.get('/tju/oaa/:type?', lazyloadRouteHandler('./routes/universities/tju/oaa'));

// 南开大学
router.get('/nku/jwc/:type?', lazyloadRouteHandler('./routes/universities/nku/jwc/index'));

// 北京航空航天大学
router.get('/buaa/news/:type', lazyloadRouteHandler('./routes/universities/buaa/news/index'));

// 浙江工业大学
router.get('/zjut/:type', lazyloadRouteHandler('./routes/universities/zjut/index'));
router.get('/zjut/design/:type', lazyloadRouteHandler('./routes/universities/zjut/design'));

// 上海大学
router.get('/shu/:type?', lazyloadRouteHandler('./routes/universities/shu/index'));
router.get('/shu/jwc/:type?', lazyloadRouteHandler('./routes/universities/shu/jwc'));

// 北京科技大学天津学院
router.get('/ustb/tj/news/:type?', lazyloadRouteHandler('./routes/universities/ustb/tj/news'));

// 深圳大学
router.get('/szu/yz/:type?', lazyloadRouteHandler('./routes/universities/szu/yz'));

// 中国石油大学（华东）
router.get('/upc/main/:type?', lazyloadRouteHandler('./routes/universities/upc/main'));
router.get('/upc/jsj/:type?', lazyloadRouteHandler('./routes/universities/upc/jsj'));

// 华北水利水电大学
// router.get('/ncwu/notice', lazyloadRouteHandler('./routes/universities/ncwu/notice'));

// 太原师范学院
// router.get('/tynu', lazyloadRouteHandler('./routes/universities/tynu/tynu'));

// 中北大学
router.get('/nuc/:type', lazyloadRouteHandler('./routes/universities/nuc/index'));

// 安徽农业大学
router.get('/ahau/cs_news/:type', lazyloadRouteHandler('./routes/universities/ahau/cs_news/index'));
router.get('/ahau/jwc/:type', lazyloadRouteHandler('./routes/universities/ahau/jwc/index'));
router.get('/ahau/main/:type', lazyloadRouteHandler('./routes/universities/ahau/main/index'));

// 安徽医科大学研究生学院
router.get('/ahmu/news', lazyloadRouteHandler('./routes/universities/ahmu/news'));

// 安徽工业大学
router.get('/ahut/news', lazyloadRouteHandler('./routes/universities/ahut/news'));
router.get('/ahut/jwc', lazyloadRouteHandler('./routes/universities/ahut/jwc'));
router.get('/ahut/cstzgg', lazyloadRouteHandler('./routes/universities/ahut/cstzgg'));

// 上海理工大学
router.get('/usst/jwc', lazyloadRouteHandler('./routes/universities/usst/jwc'));

// 临沂大学
router.get('/lyu/news/:type', lazyloadRouteHandler('./routes/universities/lyu/news/index'));

// 福州大学
router.get('/fzu/:type', lazyloadRouteHandler('./routes/universities/fzu/news'));
router.get('/fzu_min/:type', lazyloadRouteHandler('./routes/universities/fzu/news_min'));

// 厦门大学
router.get('/xmu/aero/:type', lazyloadRouteHandler('./routes/universities/xmu/aero'));

// ifanr
router.get('/ifanr/:channel?', lazyloadRouteHandler('./routes/ifanr/index'));

// 果壳网
// router.get('/guokr/scientific', lazyloadRouteHandler('./routes/guokr/scientific'));
// router.get('/guokr/:channel', lazyloadRouteHandler('./routes/guokr/calendar'));

// 联合早报 已经迁移至v2模板
// router.get('/zaobao/realtime/:section?', require('./routes/zaobao/realtime'));
// router.get('/zaobao/znews/:section?', require('./routes/zaobao/znews'));
// router.get('/zaobao/:type/:section', lazyloadRouteHandler('./routes/zaobao/index'));
// router.get('/zaobao/interactive-graphics', lazyloadRouteHandler('./routes/zaobao/interactive'));

// IPSW.me
router.get('/ipsw/index/:ptype/:pname', lazyloadRouteHandler('./routes/ipsw/index'));

// Minecraft CurseForge
router.get('/curseforge/files/:project', lazyloadRouteHandler('./routes/curseforge/files'));

// 少数派 sspai migrated to v2
// router.get('/sspai/index', lazyloadRouteHandler('./routes/sspai/index'));
// router.get('/sspai/series', lazyloadRouteHandler('./routes/sspai/series'));
// router.get('/sspai/shortcuts', lazyloadRouteHandler('./routes/sspai/shortcutsGallery'));
// router.get('/sspai/matrix', lazyloadRouteHandler('./routes/sspai/matrix'));
// router.get('/sspai/column/:id', lazyloadRouteHandler('./routes/sspai/column'));
// router.get('/sspai/author/:id', lazyloadRouteHandler('./routes/sspai/author'));
// router.get('/sspai/topics', lazyloadRouteHandler('./routes/sspai/topics'));
// router.get('/sspai/topic/:id', lazyloadRouteHandler('./routes/sspai/topic'));
// router.get('/sspai/tag/:keyword', lazyloadRouteHandler('./routes/sspai/tag'));
// router.get('/sspai/activity/:slug', lazyloadRouteHandler('./routes/sspai/activity'));

// 异次元软件世界
router.get('/iplay/home', lazyloadRouteHandler('./routes/iplay/home'));

// xclient.info
router.get('/xclient/app/:name', lazyloadRouteHandler('./routes/xclient/app'));

// 中国驻外使领事馆 migrated to v2
// router.get('/embassy/:country/:city?', lazyloadRouteHandler('./routes/embassy/index'));

// 澎湃新闻
// router.get('/thepaper/featured', lazyloadRouteHandler('./routes/thepaper/featured'));
// router.get('/thepaper/channel/:id', lazyloadRouteHandler('./routes/thepaper/channel'));
// router.get('/thepaper/list/:id', lazyloadRouteHandler('./routes/thepaper/list'));

// 澎湃美数课
// router.get('/thepaper/839studio', lazyloadRouteHandler('./routes/thepaper/839studio/studio.js'));
// router.get('/thepaper/839studio/:id', lazyloadRouteHandler('./routes/thepaper/839studio/category.js'));

// 电影首发站
router.get('/dysfz', lazyloadRouteHandler('./routes/dysfz/index'));
router.get('/dysfz/index', lazyloadRouteHandler('./routes/dysfz/index')); // 废弃

// きららファンタジア
router.get('/kirara/news', lazyloadRouteHandler('./routes/kirara/news'));

// 电影天堂
router.get('/dytt', lazyloadRouteHandler('./routes/dytt/index'));
router.get('/dytt/index', lazyloadRouteHandler('./routes/dytt/index')); // 废弃

// BT之家
// router.get('/btzj/:type?', lazyloadRouteHandler('./routes/btzj/index'));

// 人生05电影网
router.get('/rs05/rs05', lazyloadRouteHandler('./routes/rs05/rs05'));

// 人人影视 (评测推荐) migrated to v2
// router.get('/rrys/review', lazyloadRouteHandler('./routes/rrys/review'));
// 人人影视（每日更新）
// router.get('/yyets/todayfilelist', lazyloadRouteHandler('./routes/yyets/todayfilelist'));

// 趣头条
router.get('/qutoutiao/category/:cid', lazyloadRouteHandler('./routes/qutoutiao/category'));

// NHK NEW WEB EASY migrated to v2
// router.get('/nhk/news_web_easy', lazyloadRouteHandler('./routes/nhk/news_web_easy'));

// BBC
router.get('/bbc/:site?/:channel?', lazyloadRouteHandler('./routes/bbc/index'));

// Financial Times migrated to v2
// router.get('/ft/myft/:key', lazyloadRouteHandler('./routes/ft/myft'));
// router.get('/ft/:language/:channel?', lazyloadRouteHandler('./routes/ft/channel'));

// The Verge
// router.get('/verge', lazyloadRouteHandler('./routes/verge/index'));

// 看雪
router.get('/pediy/topic/:category?/:type?', lazyloadRouteHandler('./routes/pediy/topic'));

// 知晓程序
router.get('/miniapp/article/:category', lazyloadRouteHandler('./routes/miniapp/article'));
router.get('/miniapp/store/newest', lazyloadRouteHandler('./routes/miniapp/store/newest'));

// 后续
// router.get('/houxu/live/:id/:timeline?', lazyloadRouteHandler('./routes/houxu/live'));
// router.get('/houxu/events', lazyloadRouteHandler('./routes/houxu/events'));
// router.get('/houxu/lives/:type', lazyloadRouteHandler('./routes/houxu/lives'));

// 老司机
router.get('/laosiji/hot', lazyloadRouteHandler('./routes/laosiji/hot'));
router.get('/laosiji/feed', lazyloadRouteHandler('./routes/laosiji/feed'));
router.get('/laosiji/hotshow/:id', lazyloadRouteHandler('./routes/laosiji/hotshow'));

// Scientific American 60-Second Science
router.get('/60s-science', lazyloadRouteHandler('./routes/60s-science/transcript'));

// 99% Invisible
router.get('/99percentinvisible/transcript', lazyloadRouteHandler('./routes/99percentinvisible/transcript'));

// 青空文庫
router.get('/aozora/newbook/:count?', lazyloadRouteHandler('./routes/aozora/newbook'));

// solidot migrated to v2
// router.get('/solidot/:type?', lazyloadRouteHandler('./routes/solidot/main'));

// Hermes UK
router.get('/parcel/hermesuk/:tracking', lazyloadRouteHandler('./routes/parcel/hermesuk'));

// 数字尾巴
router.get('/dgtle', lazyloadRouteHandler('./routes/dgtle/index'));
router.get('/dgtle/whale/category/:category', lazyloadRouteHandler('./routes/dgtle/whale'));
router.get('/dgtle/whale/rank/:type/:rule', lazyloadRouteHandler('./routes/dgtle/whale_rank'));
router.get('/dgtle/trade/:typeId?', lazyloadRouteHandler('./routes/dgtle/trade'));
router.get('/dgtle/trade/search/:keyword', lazyloadRouteHandler('./routes/dgtle/keyword'));

// 抽屉新热榜
router.get('/chouti/top/:hour?', lazyloadRouteHandler('./routes/chouti/top'));
router.get('/chouti/:subject?', lazyloadRouteHandler('./routes/chouti'));

// 西安电子科技大学 migrated to v2
// router.get('/xidian/jwc/:category?', lazyloadRouteHandler('./routes/universities/xidian/jwc'));

// Westore
router.get('/westore/new', lazyloadRouteHandler('./routes/westore/new'));

// nHentai
router.get('/nhentai/search/:keyword/:mode?', lazyloadRouteHandler('./routes/nhentai/search'));
router.get('/nhentai/:key/:keyword/:mode?', lazyloadRouteHandler('./routes/nhentai/other'));

// 龙腾网
router.get('/ltaaa/:category?', lazyloadRouteHandler('./routes/ltaaa/index'));

// AcFun migrated to v2
// router.get('/acfun/bangumi/:id', lazyloadRouteHandler('./routes/acfun/bangumi'));
// router.get('/acfun/user/video/:uid', lazyloadRouteHandler('./routes/acfun/video'));

// Auto Trader
router.get('/autotrader/:query', lazyloadRouteHandler('./routes/autotrader'));

// 极客公园
router.get('/geekpark/breakingnews', lazyloadRouteHandler('./routes/geekpark/breakingnews'));

// 百度
router.get('/baidu/doodles', lazyloadRouteHandler('./routes/baidu/doodles'));
// router.get('/baidu/topwords/:boardId?', lazyloadRouteHandler('./routes/baidu/topwords'));
router.get('/baidu/daily', lazyloadRouteHandler('./routes/baidu/daily'));

// 搜狗
router.get('/sogou/doodles', lazyloadRouteHandler('./routes/sogou/doodles'));

// 香港天文台
router.get('/hko/weather', lazyloadRouteHandler('./routes/hko/weather'));

// sankakucomplex
router.get('/sankakucomplex/post', lazyloadRouteHandler('./routes/sankakucomplex/post'));

// 技术头条
router.get('/blogread/newest', lazyloadRouteHandler('./routes/blogread/newest'));

// gnn游戏新闻
router.get('/gnn/gnn', lazyloadRouteHandler('./routes/gnn/gnn'));

// a9vg游戏新闻
router.get('/a9vg/a9vg', lazyloadRouteHandler('./routes/a9vg/a9vg'));

// IT桔子
router.get('/itjuzi/invest', lazyloadRouteHandler('./routes/itjuzi/invest'));
router.get('/itjuzi/merge', lazyloadRouteHandler('./routes/itjuzi/merge'));

// 探物
router.get('/tanwu/products', lazyloadRouteHandler('./routes/tanwu/products'));

// GitChat
router.get('/gitchat/newest/:category?/:selected?', lazyloadRouteHandler('./routes/gitchat/newest'));

// The Guardian
router.get('/guardian/:type', lazyloadRouteHandler('./routes/guardian/guardian'));

// 下厨房
router.get('/xiachufang/user/cooked/:id', lazyloadRouteHandler('./routes/xiachufang/user/cooked'));
router.get('/xiachufang/user/created/:id', lazyloadRouteHandler('./routes/xiachufang/user/created'));
router.get('/xiachufang/popular/:timeframe?', lazyloadRouteHandler('./routes/xiachufang/popular'));

// 经济观察报
router.get('/eeo/:column?/:category?', lazyloadRouteHandler('./routes/eeo/index'));

// 腾讯视频
router.get('/tencentvideo/playlist/:id', lazyloadRouteHandler('./routes/tencent/video/playlist'));

// 看漫画 migrated to v2
// router.get('/manhuagui/comic/:id/:chapterCnt?', lazyloadRouteHandler('./routes/manhuagui/comic'));
// router.get('/mhgui/comic/:id/:chapterCnt?', lazyloadRouteHandler('./routes/mhgui/comic'));
// router.get('/twmanhuagui/comic/:id/:chapterCnt?', lazyloadRouteHandler('./routes/twmanhuagui/comic'));

// 拷贝漫画
// router.get('/copymanga/comic/:id/:chapterCnt?', lazyloadRouteHandler('./routes/copymanga/comic'));

// 拷贝漫画
// router.get('/copymanga/comic/:id', lazyloadRouteHandler('./routes/copymanga/comic'));

// 動漫狂
// router.get('/cartoonmad/comic/:id', lazyloadRouteHandler('./routes/cartoonmad/comic'));
// Vol
router.get('/vol/:mode?', lazyloadRouteHandler('./routes/vol/lastupdate'));
// 咚漫
router.get('/dongmanmanhua/:category/:name/:id', lazyloadRouteHandler('./routes/dongmanmanhua/comic'));
// webtoons
router.get('/webtoons/:lang/:category/:name/:id', lazyloadRouteHandler('./routes/webtoons/comic'));
router.get('/webtoons/naver/:id', lazyloadRouteHandler('./routes/webtoons/naver'));

// Tits Guru
router.get('/tits-guru/home', lazyloadRouteHandler('./routes/titsguru/home'));
router.get('/tits-guru/daily', lazyloadRouteHandler('./routes/titsguru/daily'));
router.get('/tits-guru/category/:type', lazyloadRouteHandler('./routes/titsguru/category'));
router.get('/tits-guru/model/:name', lazyloadRouteHandler('./routes/titsguru/model'));

// typora
// router.get('/typora/changelog', lazyloadRouteHandler('./routes/typora/changelog'));
// router.get('/typora/changelog-dev/:os?', lazyloadRouteHandler('./routes/typora/changelog-dev'));

// TSSstatus
router.get('/tssstatus/:board/:build', lazyloadRouteHandler('./routes/tssstatus'));

// Anime1
router.get('/anime1/anime/:time/:name', lazyloadRouteHandler('./routes/anime1/anime'));
router.get('/anime1/search/:keyword', lazyloadRouteHandler('./routes/anime1/search'));

// Global UDN
// router.get('/udn/global/:tid', lazyloadRouteHandler('./routes/udn/global'));

// gitea
router.get('/gitea/blog', lazyloadRouteHandler('./routes/gitea/blog'));

// iDownloadBlog
router.get('/idownloadblog', lazyloadRouteHandler('./routes/idownloadblog/index'));

// 9to5
// router.get('/9to5/:subsite/:tag?', lazyloadRouteHandler('./routes/9to5/subsite'));

// TesterHome
router.get('/testerhome/newest', lazyloadRouteHandler('./routes/testerhome/newest'));

// 刷屏
router.get('/weseepro/newest', lazyloadRouteHandler('./routes/weseepro/newest'));
router.get('/weseepro/newest-direct', lazyloadRouteHandler('./routes/weseepro/newest-direct'));
router.get('/weseepro/circle', lazyloadRouteHandler('./routes/weseepro/circle'));

// 玩物志
router.get('/coolbuy/newest', lazyloadRouteHandler('./routes/coolbuy/newest'));

// MiniFlux
router.get('/miniflux/subscription/:parameters?', lazyloadRouteHandler('./routes/miniflux/get_feeds'));
router.get('/miniflux/:feeds/:parameters?', lazyloadRouteHandler('./routes/miniflux/get_entries'));

// NGA migrated to v2
// router.get('/nga/forum/:fid/:recommend?', lazyloadRouteHandler('./routes/nga/forum'));
// router.get('/nga/post/:tid', lazyloadRouteHandler('./routes/nga/post'));

// Nautilus
// router.get('/nautilus/topic/:tid', lazyloadRouteHandler('./routes/nautilus/topics'));

// JavBus migrated to v2
// router.get('/javbus/home', lazyloadRouteHandler('./routes/javbus/home'));
// router.get('/javbus/genre/:gid', lazyloadRouteHandler('./routes/javbus/genre'));
// router.get('/javbus/star/:sid', lazyloadRouteHandler('./routes/javbus/star'));
// router.get('/javbus/series/:seriesid', lazyloadRouteHandler('./routes/javbus/series'));
// router.get('/javbus/studio/:studioid', lazyloadRouteHandler('./routes/javbus/studio'));
// router.get('/javbus/label/:labelid', lazyloadRouteHandler('./routes/javbus/label'));
// router.get('/javbus/uncensored/home', lazyloadRouteHandler('./routes/javbus/uncensored/home'));
// router.get('/javbus/uncensored/genre/:gid', lazyloadRouteHandler('./routes/javbus/uncensored/genre'));
// router.get('/javbus/uncensored/star/:sid', lazyloadRouteHandler('./routes/javbus/uncensored/star'));
// router.get('/javbus/uncensored/series/:seriesid', lazyloadRouteHandler('./routes/javbus/uncensored/series'));
// router.get('/javbus/western/home', lazyloadRouteHandler('./routes/javbus/western/home'));
// router.get('/javbus/western/genre/:gid', lazyloadRouteHandler('./routes/javbus/western/genre'));
// router.get('/javbus/western/star/:sid', lazyloadRouteHandler('./routes/javbus/western/star'));
// router.get('/javbus/western/series/:seriesid', lazyloadRouteHandler('./routes/javbus/western/series'));

// 中山大学
// router.get('/sysu/cse', lazyloadRouteHandler('./routes/universities/sysu/cse'));

// 動畫瘋
router.get('/anigamer/new_anime', lazyloadRouteHandler('./routes/anigamer/new_anime'));
router.get('/anigamer/anime/:sn', lazyloadRouteHandler('./routes/anigamer/anime'));

// Apkpure
// router.get('/apkpure/versions/:region/:pkg', lazyloadRouteHandler('./routes/apkpure/versions'));

// 豆瓣美女 migrated to v2
// router.get('/dbmv/:category?', lazyloadRouteHandler('./routes/dbmv/index'));

// 中国药科大学
router.get('/cpu/home', lazyloadRouteHandler('./routes/universities/cpu/home'));
router.get('/cpu/jwc', lazyloadRouteHandler('./routes/universities/cpu/jwc'));
router.get('/cpu/yjsy', lazyloadRouteHandler('./routes/universities/cpu/yjsy'));

// 字幕组
router.get('/zimuzu/resource/:id?', lazyloadRouteHandler('./routes/zimuzu/resource'));
router.get('/zimuzu/top/:range/:type', lazyloadRouteHandler('./routes/zimuzu/top'));

// 字幕库
router.get('/zimuku/:type?', lazyloadRouteHandler('./routes/zimuku/index'));

// SubHD.tv
// router.get('/subhd/newest', lazyloadRouteHandler('./routes/subhd/newest'));

// 虎嗅 migrated to v2
// router.get('/huxiu/tag/:id', lazyloadRouteHandler('./routes/huxiu/tag'));
// router.get('/huxiu/search/:keyword', lazyloadRouteHandler('./routes/huxiu/search'));
// router.get('/huxiu/author/:id', lazyloadRouteHandler('./routes/huxiu/author'));
// router.get('/huxiu/article', lazyloadRouteHandler('./routes/huxiu/article'));
// router.get('/huxiu/collection/:id', lazyloadRouteHandler('./routes/huxiu/collection'));

// Steam
router.get('/steam/search/:params', lazyloadRouteHandler('./routes/steam/search'));

// Steamgifts
router.get('/steamgifts/discussions/:category?', lazyloadRouteHandler('./routes/steam/steamgifts/discussions'));

// 扇贝
router.get('/shanbay/checkin/:id', lazyloadRouteHandler('./routes/shanbay/checkin'));
router.get('/shanbay/footprints/:category?', lazyloadRouteHandler('./routes/shanbay/footprints'));

// Facebook
router.get('/facebook/page/:id', lazyloadRouteHandler('./routes/facebook/page'));

// 币乎
router.get('/bihu/activaties/:id', lazyloadRouteHandler('./routes/bihu/activaties'));

// 停电通知
router.get('/tingdiantz/nanjing', lazyloadRouteHandler('./routes/tingdiantz/nanjing'));
router.get('/tingdiantz/95598/:province/:city/:district?', lazyloadRouteHandler('./routes/tingdiantz/95598'));

// 36kr migrated to v2
// router.get('/36kr/search/article/:keyword', lazyloadRouteHandler('./routes/36kr/search/article'));
// router.get('/36kr/newsflashes', lazyloadRouteHandler('./routes/36kr/newsflashes'));
// router.get('/36kr/news/:category?', lazyloadRouteHandler('./routes/36kr/news'));
// router.get('/36kr/user/:uid', lazyloadRouteHandler('./routes/36kr/user'));
// router.get('/36kr/motif/:mid', lazyloadRouteHandler('./routes/36kr/motif'));

// PMCAFF
router.get('/pmcaff/list/:typeid', lazyloadRouteHandler('./routes/pmcaff/list'));
router.get('/pmcaff/feed/:typeid', lazyloadRouteHandler('./routes/pmcaff/feed'));
router.get('/pmcaff/user/:userid', lazyloadRouteHandler('./routes/pmcaff/user'));

// icourse163
router.get('/icourse163/newest', lazyloadRouteHandler('./routes/icourse163/newest'));

// patchwork.kernel.org
router.get('/patchwork.kernel.org/comments/:id', lazyloadRouteHandler('./routes/patchwork.kernel.org/comments'));

// 京东众筹
router.get('/jingdong/zhongchou/:type/:status/:sort', lazyloadRouteHandler('./routes/jingdong/zhongchou'));

// All Poetry
router.get('/allpoetry/:order?', lazyloadRouteHandler('./routes/allpoetry/order'));

// 华尔街见闻
// router.get('/wallstreetcn/news/global', lazyloadRouteHandler('./routes/wallstreetcn/news'));
// router.get('/wallstreetcn/live/:channel?', lazyloadRouteHandler('./routes/wallstreetcn/live'));

// 多抓鱼搜索
router.get('/duozhuayu/search/:wd', lazyloadRouteHandler('./routes/duozhuayu/search'));

// 创业邦
router.get('/cyzone/author/:id', lazyloadRouteHandler('./routes/cyzone/author'));
router.get('/cyzone/label/:name', lazyloadRouteHandler('./routes/cyzone/label'));

// 政府
// router.get('/gov/zhengce/zuixin', lazyloadRouteHandler('./routes/gov/zhengce/zuixin'));
// router.get('/gov/zhengce/wenjian/:pcodeJiguan?', lazyloadRouteHandler('./routes/gov/zhengce/wenjian'));
// router.get('/gov/zhengce/govall/:advance?', lazyloadRouteHandler('./routes/gov/zhengce/govall'));
router.get('/gov/province/:name/:category', lazyloadRouteHandler('./routes/gov/province'));
router.get('/gov/city/:name/:category', lazyloadRouteHandler('./routes/gov/city'));
router.get('/gov/statecouncil/briefing', lazyloadRouteHandler('./routes/gov/statecouncil/briefing'));
router.get('/gov/news/:uid', lazyloadRouteHandler('./routes/gov/news'));
router.get('/gov/shuju/:caty/:item', lazyloadRouteHandler('./routes/gov/shuju'));
router.get('/gov/xinwen/tujie/:caty', lazyloadRouteHandler('./routes/gov/xinwen/tujie'));

// 苏州
router.get('/gov/suzhou/news/:uid', lazyloadRouteHandler('./routes/gov/suzhou/news'));
router.get('/gov/suzhou/doc', lazyloadRouteHandler('./routes/gov/suzhou/doc'));

// 江苏
// router.get('/gov/jiangsu/eea/:type?', lazyloadRouteHandler('./routes/gov/jiangsu/eea'));

// 山西
router.get('/gov/shanxi/rst/:category', lazyloadRouteHandler('./routes/gov/shanxi/rst'));

// 湖南
router.get('/gov/hunan/notice/:type', lazyloadRouteHandler('./routes/gov/hunan/notice'));

// 中华人民共和国国家发展和改革委员会
router.get('/gov/ndrc/xwdt/:caty?', lazyloadRouteHandler('./routes/gov/ndrc/xwdt'));

// 中华人民共和国-海关总署 migrated to v2
// router.get('/gov/customs/list/:gchannel', lazyloadRouteHandler('./routes/gov/customs/list'));

// 中华人民共和国教育部
// router.get('/gov/moe/:type', lazyloadRouteHandler('./routes/gov/moe/moe'));

// 中华人民共和国外交部
// router.get('/gov/fmprc/fyrbt', lazyloadRouteHandler('./routes/gov/fmprc/fyrbt'));

// 中华人民共和国住房和城乡建设部
router.get('/gov/mohurd/policy', lazyloadRouteHandler('./routes/gov/mohurd/policy'));

// 国家新闻出版广电总局
router.get('/gov/sapprft/approval/:channel/:detail?', lazyloadRouteHandler('./routes/gov/sapprft/7026'));

// 国家新闻出版署
router.get('/gov/nppa/:channel', lazyloadRouteHandler('./routes/gov/nppa/channels'));
router.get('/gov/nppa/:channel/:content', lazyloadRouteHandler('./routes/gov/nppa/contents'));

// 北京卫生健康委员会
router.get('/gov/beijing/mhc/:caty', lazyloadRouteHandler('./routes/gov/beijing/mhc'));

// 北京考试院
router.get('/gov/beijing/bjeea/:type', lazyloadRouteHandler('./routes/gov/beijing/eea'));

// 广东省教育厅
router.get('/gov/guangdong/edu/:caty', lazyloadRouteHandler('./routes/gov/guangdong/edu'));

// 广东省教育考试院
router.get('/gov/guangdong/eea/:caty', lazyloadRouteHandler('./routes/gov/guangdong/eea'));

// 广东省深圳市
// router.get('/gov/shenzhen/xxgk/zfxxgj/:caty', lazyloadRouteHandler('./routes/gov/shenzhen/xxgk/zfxxgj'));

// 日本国外務省記者会見
router.get('/go.jp/mofa', lazyloadRouteHandler('./routes/go.jp/mofa/main'));

// 小黑盒
router.get('/xiaoheihe/user/:id', lazyloadRouteHandler('./routes/xiaoheihe/user'));
router.get('/xiaoheihe/news', lazyloadRouteHandler('./routes/xiaoheihe/news'));
router.get('/xiaoheihe/discount/:platform?', lazyloadRouteHandler('./routes/xiaoheihe/discount'));

// 惠誉评级
router.get('/fitchratings/site/:type', lazyloadRouteHandler('./routes/fitchratings/site'));

// 移动支付 migrated to v2
// router.get('/mpaypass/news', lazyloadRouteHandler('./routes/mpaypass/news'));
// router.get('/mpaypass/main/:type?', lazyloadRouteHandler('./routes/mpaypass/main'));

// 新浪科技探索
router.get('/sina/discovery/:type', lazyloadRouteHandler('./routes/sina/discovery'));

// 新浪科技滚动新闻
router.get('/sina/rollnews', lazyloadRouteHandler('./routes/sina/rollnews'));

// 新浪体育
router.get('/sina/sports/:type', lazyloadRouteHandler('./routes/sina/sports'));

// 新浪专栏创事记
router.get('/sina/csj', lazyloadRouteHandler('./routes/sina/chuangshiji'));

// 新浪财经－国內
router.get('/sina/finance', lazyloadRouteHandler('./routes/sina/finance'));

// Animen
router.get('/animen/news/:type', lazyloadRouteHandler('./routes/animen/news'));

// D2 资源库
router.get('/d2/daily', lazyloadRouteHandler('./routes/d2/daily'));

// ebb
router.get('/ebb', lazyloadRouteHandler('./routes/ebb'));

// Indienova
router.get('/indienova/:type', lazyloadRouteHandler('./routes/indienova/article'));

// JPMorgan Chase Institute
router.get('/jpmorganchase', lazyloadRouteHandler('./routes/jpmorganchase/research'));

// 美拍
router.get('/meipai/user/:uid', lazyloadRouteHandler('./routes/meipai/user'));

// 多知网
router.get('/duozhi', lazyloadRouteHandler('./routes/duozhi'));

// 人人都是产品经理
// router.get('/woshipm/popular', lazyloadRouteHandler('./routes/woshipm/popular'));
// router.get('/woshipm/wen', lazyloadRouteHandler('./routes/woshipm/wen'));
// router.get('/woshipm/bookmarks/:id', lazyloadRouteHandler('./routes/woshipm/bookmarks'));
// router.get('/woshipm/user_article/:id', lazyloadRouteHandler('./routes/woshipm/user_article'));
// router.get('/woshipm/latest', lazyloadRouteHandler('./routes/woshipm/latest'));

// 高清电台
router.get('/gaoqing/latest', lazyloadRouteHandler('./routes/gaoqing/latest'));

// 鲸跃汽车
router.get('/whalegogo/home', lazyloadRouteHandler('./routes/whalegogo/home'));
router.get('/whalegogo/portal/:type_id/:tagid?', lazyloadRouteHandler('./routes/whalegogo/portal'));

// 爱思想
router.get('/aisixiang/column/:id', lazyloadRouteHandler('./routes/aisixiang/column'));
router.get('/aisixiang/ranking/:type?/:range?', lazyloadRouteHandler('./routes/aisixiang/ranking'));
router.get('/aisixiang/thinktank/:name/:type?', lazyloadRouteHandler('./routes/aisixiang/thinktank'));

// Hacker News
// router.get('/hackernews/:section/:type?', lazyloadRouteHandler('./routes/hackernews/story'));

// LeetCode
// router.get('/leetcode/articles', lazyloadRouteHandler('./routes/leetcode/articles'));
router.get('/leetcode/submission/us/:user', lazyloadRouteHandler('./routes/leetcode/check-us'));
router.get('/leetcode/submission/cn/:user', lazyloadRouteHandler('./routes/leetcode/check-cn'));

// 虎扑
// router.get('/hupu/bxj/:id/:order?', lazyloadRouteHandler('./routes/hupu/bbs'));
// router.get('/hupu/bbs/:id/:order?', lazyloadRouteHandler('./routes/hupu/bbs'));
// router.get('/hupu/all/:caty', lazyloadRouteHandler('./routes/hupu/all'));
// router.get('/hupu/dept/:dept', lazyloadRouteHandler('./routes/hupu/dept'));

// 牛客网 migrated to v2
// router.get('/nowcoder/discuss/:type/:order', lazyloadRouteHandler('./routes/nowcoder/discuss'));
// router.get('/nowcoder/schedule/:propertyId?/:typeId?', lazyloadRouteHandler('./routes/nowcoder/schedule'));
// router.get('/nowcoder/recommend', lazyloadRouteHandler('./routes/nowcoder/recommend'));
// router.get('/nowcoder/jobcenter/:recruitType?/:city?/:type?/:order?/:latest?', lazyloadRouteHandler('./routes/nowcoder/jobcenter'));

// Xiaomi.eu
router.get('/xiaomieu/releases', lazyloadRouteHandler('./routes/xiaomieu/releases'));

// sketch.com
router.get('/sketch/beta', lazyloadRouteHandler('./routes/sketch/beta'));
router.get('/sketch/updates', lazyloadRouteHandler('./routes/sketch/updates'));

// 每日安全
router.get('/security/pulses', lazyloadRouteHandler('./routes/security/pulses'));

// DoNews
router.get('/donews/:column?', lazyloadRouteHandler('./routes/donews/index'));

// WeGene
router.get('/wegene/column/:type/:category', lazyloadRouteHandler('./routes/wegene/column'));
router.get('/wegene/newest', lazyloadRouteHandler('./routes/wegene/newest'));

// instapaper
router.get('/instapaper/person/:name', lazyloadRouteHandler('./routes/instapaper/person'));

// UI 中国
router.get('/ui-cn/article', lazyloadRouteHandler('./routes/ui-cn/article'));
router.get('/ui-cn/user/:id', lazyloadRouteHandler('./routes/ui-cn/user'));

// Dcard
// router.get('/dcard/:section/:type?', lazyloadRouteHandler('./routes/dcard/section'));

// 北京天文馆每日一图
// router.get('/bjp/apod', lazyloadRouteHandler('./routes/bjp/apod'));

// 洛谷
// router.get('/luogu/daily/:id?', lazyloadRouteHandler('./routes/luogu/daily'));
// router.get('/luogu/contest', lazyloadRouteHandler('./routes/luogu/contest'));
// router.get('/luogu/user/feed/:uid', lazyloadRouteHandler('./routes/luogu/userFeed'));

// 决胜网
router.get('/juesheng', lazyloadRouteHandler('./routes/juesheng'));

// 播客IBCラジオ イヤーマイッタマイッタ
router.get('/maitta', lazyloadRouteHandler('./routes/maitta'));

// 一些博客
// 敬维-以认真的态度做完美的事情: https://jingwei.link/
router.get('/blogs/jingwei.link', lazyloadRouteHandler('./routes/blogs/jingwei_link'));

// 王垠的博客-当然我在扯淡
router.get('/blogs/wangyin', lazyloadRouteHandler('./routes/blogs/wangyin'));

// 王五四文集
router.get('/blogs/wang54/:id?', lazyloadRouteHandler('./routes/blogs/wang54'));

// WordPress
router.get('/blogs/wordpress/:domain/:https?', lazyloadRouteHandler('./routes/blogs/wordpress'));

// 裏垢女子まとめ migrated to v2
// router.get('/uraaka-joshi', lazyloadRouteHandler('./routes/uraaka-joshi/uraaka-joshi'));
// router.get('/uraaka-joshi/:id', lazyloadRouteHandler('./routes/uraaka-joshi/uraaka-joshi-user'));

// 西祠胡同
router.get('/xici/:id?', lazyloadRouteHandler('./routes/xici'));

// 淘股吧论坛
// router.get('/taoguba/index', lazyloadRouteHandler('./routes/taoguba/index'));
// router.get('/taoguba/user/:uid', lazyloadRouteHandler('./routes/taoguba/user'));

// 今日热榜
router.get('/tophub/:id', lazyloadRouteHandler('./routes/tophub'));

// 游戏时光
router.get('/vgtime/news', lazyloadRouteHandler('./routes/vgtime/news.js'));
router.get('/vgtime/release', lazyloadRouteHandler('./routes/vgtime/release'));
router.get('/vgtime/keyword/:keyword', lazyloadRouteHandler('./routes/vgtime/keyword'));

// MP4吧
router.get('/mp4ba/:param', lazyloadRouteHandler('./routes/mp4ba'));

// anitama
router.get('/anitama/:channel?', lazyloadRouteHandler('./routes/anitama/channel'));

// 親子王國
router.get('/babykingdom/:id/:order?', lazyloadRouteHandler('./routes/babykingdom'));

// 四川大学
router.get('/scu/jwc/notice', lazyloadRouteHandler('./routes/universities/scu/jwc'));
router.get('/scu/xg/notice', lazyloadRouteHandler('./routes/universities/scu/xg'));

// 浙江工商大学
router.get('/zjgsu/tzgg', lazyloadRouteHandler('./routes/universities/zjgsu/tzgg/scripts'));
router.get('/zjgsu/gsgg', lazyloadRouteHandler('./routes/universities/zjgsu/gsgg/scripts'));
router.get('/zjgsu/xszq', lazyloadRouteHandler('./routes/universities/zjgsu/xszq/scripts'));

// 大众点评
router.get('/dianping/user/:id?', lazyloadRouteHandler('./routes/dianping/user'));

// 半月谈
router.get('/banyuetan/byt/:time?', lazyloadRouteHandler('./routes/banyuetan/byt'));
router.get('/banyuetan/:name', lazyloadRouteHandler('./routes/banyuetan'));

// 人民网
// router.get('/people/opinion/:id', lazyloadRouteHandler('./routes/people/opinion'));
// router.get('/people/env/:id', lazyloadRouteHandler('./routes/people/env'));
// router.get('/people/xjpjh/:keyword?/:year?', lazyloadRouteHandler('./routes/people/xjpjh'));
// router.get('/people/cpc/24h', lazyloadRouteHandler('./routes/people/cpc/24h'));

// 北极星电力网 migrated to v2
// router.get('/bjx/huanbao', lazyloadRouteHandler('./routes/bjx/huanbao'));

// gamersky
router.get('/gamersky/news', lazyloadRouteHandler('./routes/gamersky/news'));
router.get('/gamersky/ent/:category', lazyloadRouteHandler('./routes/gamersky/ent'));

// 游研社
// router.get('/yystv/category/:category', lazyloadRouteHandler('./routes/yystv/category'));
// router.get('/yystv/docs', lazyloadRouteHandler('./routes/yystv/docs'));

// konami
router.get('/konami/pesmobile/:lang?/:os?', lazyloadRouteHandler('./routes/konami/pesmobile'));

// psnine
router.get('/psnine/index', lazyloadRouteHandler('./routes/psnine/index'));
router.get('/psnine/shuzhe', lazyloadRouteHandler('./routes/psnine/shuzhe'));
router.get('/psnine/trade', lazyloadRouteHandler('./routes/psnine/trade'));
router.get('/psnine/game', lazyloadRouteHandler('./routes/psnine/game'));
router.get('/psnine/news/:order?', lazyloadRouteHandler('./routes/psnine/news'));
router.get('/psnine/node/:id?/:order?', lazyloadRouteHandler('./routes/psnine/node'));

// 浙江大学 migrated to v2
// router.get('/zju/list/:type', lazyloadRouteHandler('./routes/universities/zju/list'));
// router.get('/zju/physics/:type', lazyloadRouteHandler('./routes/universities/zju/physics'));
// router.get('/zju/grs/:type', lazyloadRouteHandler('./routes/universities/zju/grs'));
// router.get('/zju/career/:type', lazyloadRouteHandler('./routes/universities/zju/career'));
// router.get('/zju/cst/:type', lazyloadRouteHandler('./routes/universities/zju/cst'));
// router.get('/zju/cst/custom/:id', lazyloadRouteHandler('./routes/universities/zju/cst/custom'));

// 浙江大学城市学院
router.get('/zucc/news/latest', lazyloadRouteHandler('./routes/universities/zucc/news'));
router.get('/zucc/cssearch/latest/:webVpn/:key', lazyloadRouteHandler('./routes/universities/zucc/cssearch'));

// 华中师范大学
router.get('/ccnu/career', lazyloadRouteHandler('./routes/universities/ccnu/career'));

// Infoq
// router.get('/infoq/recommend', lazyloadRouteHandler('./routes/infoq/recommend'));
// router.get('/infoq/topic/:id', lazyloadRouteHandler('./routes/infoq/topic'));

// checkee
router.get('/checkee/:dispdate', lazyloadRouteHandler('./routes/checkee/index'));

// ZAKER migrated to v2
// router.get('/zaker/:type/:id', lazyloadRouteHandler('./routes/zaker/source'));
// router.get('/zaker/focusread', lazyloadRouteHandler('./routes/zaker/focusread'));

// Matters
router.get('/matters/latest/:type?', lazyloadRouteHandler('./routes/matters/latest'));
router.redirect('/matters/hot', '/matters/latest/heat'); // Deprecated
router.get('/matters/tags/:tid', lazyloadRouteHandler('./routes/matters/tags'));
router.get('/matters/author/:uid', lazyloadRouteHandler('./routes/matters/author'));

// MobData
router.get('/mobdata/report', lazyloadRouteHandler('./routes/mobdata/report'));

// 谷雨
router.get('/tencent/guyu/channel/:name', lazyloadRouteHandler('./routes/tencent/guyu/channel'));

// 古诗文网
router.get('/gushiwen/recommend/:annotation?', lazyloadRouteHandler('./routes/gushiwen/recommend'));

// 电商在线
router.get('/imaijia/category/:category', lazyloadRouteHandler('./routes/imaijia/category'));

// 21财经
router.get('/21caijing/channel/:name', lazyloadRouteHandler('./routes/21caijing/channel'));

// 北京邮电大学
router.get('/bupt/yz/:type', lazyloadRouteHandler('./routes/universities/bupt/yz'));
router.get('/bupt/grs', lazyloadRouteHandler('./routes/universities/bupt/grs'));
router.get('/bupt/portal', lazyloadRouteHandler('./routes/universities/bupt/portal'));
router.get('/bupt/news', lazyloadRouteHandler('./routes/universities/bupt/news'));
router.get('/bupt/funbox', lazyloadRouteHandler('./routes/universities/bupt/funbox'));

// VOCUS 方格子
// router.get('/vocus/publication/:id', lazyloadRouteHandler('./routes/vocus/publication'));
// router.get('/vocus/user/:id', lazyloadRouteHandler('./routes/vocus/user'));

// 一亩三分地 1point3acres
router.get('/1point3acres/blog/:category?', lazyloadRouteHandler('./routes/1point3acres/blog'));
router.get('/1point3acres/user/:id/threads', lazyloadRouteHandler('./routes/1point3acres/threads'));
router.get('/1point3acres/user/:id/posts', lazyloadRouteHandler('./routes/1point3acres/posts'));
router.get('/1point3acres/offer/:year?/:major?/:school?', lazyloadRouteHandler('./routes/1point3acres/offer'));
router.get('/1point3acres/post/:category', lazyloadRouteHandler('./routes/1point3acres/post'));

// 广东海洋大学
router.get('/gdoujwc', lazyloadRouteHandler('./routes/universities/gdou/jwc/jwtz'));

// 中国高清网
router.get('/gaoqingla/:tag?', lazyloadRouteHandler('./routes/gaoqingla/latest'));

// 马良行
router.get('/mlhang', lazyloadRouteHandler('./routes/mlhang/latest'));

// PlayStation Store
router.get('/ps/list/:gridName', lazyloadRouteHandler('./routes/ps/list'));
router.get('/ps/trophy/:id', lazyloadRouteHandler('./routes/ps/trophy'));
router.get('/ps/ps4updates', lazyloadRouteHandler('./routes/ps/ps4updates'));
router.get('/ps/:lang?/product/:gridName', lazyloadRouteHandler('./routes/ps/product'));

// Quanta Magazine
router.get('/quantamagazine/archive', lazyloadRouteHandler('./routes/quantamagazine/archive'));

// Nintendo migrated to v2
// router.get('/nintendo/eshop/jp', lazyloadRouteHandler('./routes/nintendo/eshop_jp'));
// router.get('/nintendo/eshop/hk', lazyloadRouteHandler('./routes/nintendo/eshop_hk'));
// router.get('/nintendo/eshop/us', lazyloadRouteHandler('./routes/nintendo/eshop_us'));
// router.get('/nintendo/eshop/cn', lazyloadRouteHandler('./routes/nintendo/eshop_cn'));
// router.get('/nintendo/news', lazyloadRouteHandler('./routes/nintendo/news'));
// router.get('/nintendo/news/china', lazyloadRouteHandler('./routes/nintendo/news_china'));
// router.get('/nintendo/direct', lazyloadRouteHandler('./routes/nintendo/direct'));
// router.get('/nintendo/system-update', lazyloadRouteHandler('./routes/nintendo/system-update'));

// 世界卫生组织 migrated to v2
// router.get('/who/news-room/:category?/:language?', lazyloadRouteHandler('./routes/who/news-room'));
// router.get('/who/speeches/:language?', lazyloadRouteHandler('./routes/who/speeches'));
// router.get('/who/news/:language?', lazyloadRouteHandler('./routes/who/news'));

// 福利资源-met.red
router.get('/metred/fuli', lazyloadRouteHandler('./routes/metred/fuli'));

// MIT
router.get('/mit/graduateadmissions/:type/:name', lazyloadRouteHandler('./routes/universities/mit/graduateadmissions'));
router.get('/mit/ocw-top', lazyloadRouteHandler('./routes/universities/mit/ocw-top'));
router.get('/mit/csail/news', lazyloadRouteHandler('./routes/universities/mit/csail/news'));

// 毕马威
router.get('/kpmg/insights', lazyloadRouteHandler('./routes/kpmg/insights'));

// Saraba1st
// router.get('/saraba1st/thread/:tid', lazyloadRouteHandler('./routes/saraba1st/thread'));

// gradcafe
router.get('/gradcafe/result/:type', lazyloadRouteHandler('./routes/gradcafe/result'));
router.get('/gradcafe/result', lazyloadRouteHandler('./routes/gradcafe/result'));

// The Economist migrated to v2
// router.get('/the-economist/download', lazyloadRouteHandler('./routes/the-economist/download'));
// router.get('/the-economist/gre-vocabulary', lazyloadRouteHandler('./routes/the-economist/gre-vocabulary'));
// router.get('/the-economist/:endpoint', lazyloadRouteHandler('./routes/the-economist/full'));

// 鼠绘漫画
router.get('/shuhui/comics/:id', lazyloadRouteHandler('./routes/shuhui/comics'));

// 朝日新闻
router.get('/asahi/area/:id', lazyloadRouteHandler('./routes/asahi/area'));
router.get('/asahi/:genre?/:category?', lazyloadRouteHandler('./routes/asahi/index'));

// 7x24小时快讯
router.get('/fx678/kx', lazyloadRouteHandler('./routes/fx678/kx'));

// SoundCloud
router.get('/soundcloud/tracks/:user', lazyloadRouteHandler('./routes/soundcloud/tracks'));

// dilidili
router.get('/dilidili/fanju/:id', lazyloadRouteHandler('./routes/dilidili/fanju'));

// 且听风吟福利
router.get('/qtfyfl/:category', lazyloadRouteHandler('./routes/qtfyfl/category'));

// 派代
router.get('/paidai', lazyloadRouteHandler('./routes/paidai/index'));
router.get('/paidai/bbs', lazyloadRouteHandler('./routes/paidai/bbs'));
router.get('/paidai/news', lazyloadRouteHandler('./routes/paidai/news'));

// 中国银行
router.get('/boc/whpj/:format?', lazyloadRouteHandler('./routes/boc/whpj'));

// 漫画db
router.get('/manhuadb/comics/:id', lazyloadRouteHandler('./routes/manhuadb/comics'));

// 装备前线
router.get('/zfrontier/postlist/:type', lazyloadRouteHandler('./routes/zfrontier/postlist'));
router.get('/zfrontier/board/:boardId', lazyloadRouteHandler('./routes/zfrontier/board_postlist'));

// 观察者网
// router.get('/guancha/headline', lazyloadRouteHandler('./routes/guancha/headline'));
// router.get('/guancha/topic/:id/:order?', lazyloadRouteHandler('./routes/guancha/topic'));
// router.get('/guancha/member/:caty?', lazyloadRouteHandler('./routes/guancha/member'));
// router.get('/guancha/personalpage/:uid', lazyloadRouteHandler('./routes/guancha/personalpage'));
// router.get('/guancha/:caty?', lazyloadRouteHandler('./routes/guancha/index'));

// router.get('/guanchazhe/topic/:id/:order?', lazyloadRouteHandler('./routes/guancha/topic'));
// router.get('/guanchazhe/personalpage/:uid', lazyloadRouteHandler('./routes/guancha/personalpage'));
// router.get('/guanchazhe/index/:caty?', lazyloadRouteHandler('./routes/guancha/index'));

// Hpoi 手办维基
router.get('/hpoi/info/:type?', lazyloadRouteHandler('./routes/hpoi/info'));
router.get('/hpoi/:category/:words', lazyloadRouteHandler('./routes/hpoi'));
router.get('/hpoi/user/:user_id/:caty', lazyloadRouteHandler('./routes/hpoi/user'));

// 通用CurseForge
router.get('/curseforge/:gameid/:catagoryid/:projectid/files', lazyloadRouteHandler('./routes/curseforge/generalfiles'));

// 西南财经大学
router.get('/swufe/seie/:type?', lazyloadRouteHandler('./routes/universities/swufe/seie'));

// Wired
router.get('/wired/tag/:tag', lazyloadRouteHandler('./routes/wired/tag'));

// 语雀文档
// router.get('/yuque/doc/:repo_id', lazyloadRouteHandler('./routes/yuque/doc'));

// 飞地
router.get('/enclavebooks/category/:id?', lazyloadRouteHandler('./routes/enclavebooks/category'));
router.get('/enclavebooks/user/:uid', lazyloadRouteHandler('./routes/enclavebooks/user.js'));
router.get('/enclavebooks/collection/:uid', lazyloadRouteHandler('./routes/enclavebooks/collection.js'));

// 色花堂
// router.get('/dsndsht23/picture/:subforumid', lazyloadRouteHandler('./routes/dsndsht23/index'));
// router.get('/dsndsht23/bt/:subforumid?', lazyloadRouteHandler('./routes/dsndsht23/index'));
// router.get('/dsndsht23/:subforumid?/:type?', lazyloadRouteHandler('./routes/dsndsht23/index'));
// router.get('/dsndsht23/:subforumid?', lazyloadRouteHandler('./routes/dsndsht23/index'));
// router.get('/dsndsht23', lazyloadRouteHandler('./routes/dsndsht23/index'));

// 数英网最新文章
router.get('/digitaling/index', lazyloadRouteHandler('./routes/digitaling/index'));

// 数英网文章专题
router.get('/digitaling/articles/:category/:subcate', lazyloadRouteHandler('./routes/digitaling/article'));

// 数英网项目专题
router.get('/digitaling/projects/:category', lazyloadRouteHandler('./routes/digitaling/project'));

// Bing壁纸
router.get('/bing', lazyloadRouteHandler('./routes/bing/index'));

// Maxjia News - DotA 2
router.get('/maxnews/dota2', lazyloadRouteHandler('./routes/maxnews/dota2'));

// 柠檬 - 私房歌
router.get('/ningmeng/song', lazyloadRouteHandler('./routes/ningmeng/song'));

// 紫竹张先生
router.get('/zzz/:category?/:language?', lazyloadRouteHandler('./routes/zzz'));

// AEON
router.get('/aeon/:cid', lazyloadRouteHandler('./routes/aeon/category'));

// AlgoCasts
router.get('/algocasts', lazyloadRouteHandler('./routes/algocasts/all'));

// aqicn
router.get('/aqicn/:city/:pollution?', lazyloadRouteHandler('./routes/aqicn/index'));

// 猫眼电影
router.get('/maoyan/hot', lazyloadRouteHandler('./routes/maoyan/hot'));
router.get('/maoyan/upcoming', lazyloadRouteHandler('./routes/maoyan/upcoming'));
router.get('/maoyan/hotComplete/:orderby?/:ascOrDesc?/:top?', lazyloadRouteHandler('./routes/maoyan/hotComplete'));

// cnBeta
// router.get('/cnbeta', lazyloadRouteHandler('./routes/cnbeta/home'));
// router.get('/cnbeta/topic/:topic_id', lazyloadRouteHandler('./routes/cnbeta/topic'));

// 国家退伍士兵信息
router.get('/gov/veterans/:type', lazyloadRouteHandler('./routes/gov/veterans/china'));

// 河北省退伍士兵信息
router.get('/gov/veterans/hebei/:type', lazyloadRouteHandler('./routes/gov/veterans/hebei'));

// Dilbert Comic Strip
router.get('/dilbert/strip', lazyloadRouteHandler('./routes/dilbert/strip'));

// 游戏打折情报
// router.get('/yxdzqb/:type', lazyloadRouteHandler('./routes/yxdzqb'));

// 怪物猎人
router.get('/monsterhunter/update', lazyloadRouteHandler('./routes/mhw/update'));
router.get('/mhw/update', lazyloadRouteHandler('./routes/mhw/update'));
router.get('/mhw/news', lazyloadRouteHandler('./routes/mhw/news'));

// 005.tv
router.get('/005tv/zx/latest', lazyloadRouteHandler('./routes/005tv/zx'));

// Polimi News
router.get('/polimi/news/:language?', lazyloadRouteHandler('./routes/polimi/news'));

// dekudeals
router.get('/dekudeals/:type', lazyloadRouteHandler('./routes/dekudeals'));

// 直播吧 migrated to v2
// router.get('/zhibo8/forum/:id', lazyloadRouteHandler('./routes/zhibo8/forum'));
// router.get('/zhibo8/post/:id', lazyloadRouteHandler('./routes/zhibo8/post'));
// router.get('/zhibo8/more/:category?', lazyloadRouteHandler('./routes/zhibo8/more'));

// 东方网 migrated to v2
// router.get('/eastday/sh', require('./routes/eastday/sh'));
// router.get('/eastday/24/:category?', require('./routes/eastday/24'));

// Metacritic
router.get('/metacritic/release/:platform/:type/:sort?', lazyloadRouteHandler('./routes/metacritic/release'));

// 快科技（原驱动之家）
router.get('/kkj/news', lazyloadRouteHandler('./routes/kkj/news'));

// Outage.Report
// router.get('/outagereport/:name/:count?', lazyloadRouteHandler('./routes/outagereport/service'));

// sixthtone
router.get('/sixthtone/news', lazyloadRouteHandler('./routes/sixthtone/news'));

// AI研习社
router.get('/aiyanxishe/:id/:sort?', lazyloadRouteHandler('./routes/aiyanxishe/home'));

// 活动行
router.get('/huodongxing/explore', lazyloadRouteHandler('./routes/hdx/explore'));

// 飞客茶馆优惠信息
// router.get('/flyert/preferential', lazyloadRouteHandler('./routes/flyert/preferential'));
// router.get('/flyert/creditcard/:bank', lazyloadRouteHandler('./routes/flyert/creditcard'));
// router.get('/flyertea/preferential', lazyloadRouteHandler('./routes/flyert/preferential'));
// router.get('/flyertea/creditcard/:bank', lazyloadRouteHandler('./routes/flyert/creditcard'));

// 中国广播
// router.get('/radio/:channelname/:name', lazyloadRouteHandler('./routes/radio/radio'));

// TOPYS
// router.get('/topys/:category', lazyloadRouteHandler('./routes/topys/article'));

// 巴比特作者专栏
router.get('/8btc/:authorid', lazyloadRouteHandler('./routes/8btc/author'));
router.get('/8btc/news/flash', lazyloadRouteHandler('./routes/8btc/news/flash'));

// VueVlog
router.get('/vuevideo/:userid', lazyloadRouteHandler('./routes/vuevideo/user'));

// 证监会
// router.get('/csrc/news/:suffix?', lazyloadRouteHandler('./routes/csrc/news'));
// router.get('/csrc/fashenwei', lazyloadRouteHandler('./routes/csrc/fashenwei'));
// router.get('/csrc/auditstatus/:apply_id', lazyloadRouteHandler('./routes/csrc/auditstatus'));

// LWN.net Alerts
router.get('/lwn/alerts/:distributor', lazyloadRouteHandler('./routes/lwn/alerts'));

// 英雄联盟
router.get('/lol/newsindex/:type', lazyloadRouteHandler('./routes/lol/newsindex'));

// 掌上英雄联盟
router.get('/lolapp/recommend', lazyloadRouteHandler('./routes/lolapp/recommend'));
router.get('/lolapp/article/:uuid', lazyloadRouteHandler('./routes/lolapp/article'));

// 左岸读书
router.get('/zreading', lazyloadRouteHandler('./routes/zreading/home'));

// NBA
router.get('/nba/app_news', lazyloadRouteHandler('./routes/nba/app_news'));

// 天津产权交易中心
router.get('/tprtc/cqzr', lazyloadRouteHandler('./routes/tprtc/cqzr'));
router.get('/tprtc/qyzc', lazyloadRouteHandler('./routes/tprtc/qyzc'));
router.get('/tprtc/news', lazyloadRouteHandler('./routes/tprtc/news'));

// ArchDaily
router.get('/archdaily', lazyloadRouteHandler('./routes/archdaily/home'));

// aptonic Dropzone actions
router.get('/aptonic/action/:untested?', lazyloadRouteHandler('./routes/aptonic/action'));

// 印记中文周刊
// router.get('/docschina/jsweekly', lazyloadRouteHandler('./routes/docschina/jsweekly'));

// im2maker
router.get('/im2maker/:channel?', lazyloadRouteHandler('./routes/im2maker/index'));

// 巨潮资讯
router.get('/cninfo/announcement/:column/:code/:orgId/:category?/:search?', lazyloadRouteHandler('./routes/cninfo/announcement'));

// 金十数据
// router.get('/jinshi/index', lazyloadRouteHandler('./routes/jinshi/index'));

// 中华人民共和国农业农村部
router.get('/gov/moa/sjzxfb', lazyloadRouteHandler('./routes/gov/moa/sjzxfb'));
router.get('/gov/moa/:suburl(.*)', lazyloadRouteHandler('./routes/gov/moa/moa'));

// 香水时代
router.get('/nosetime/:id/:type/:sort?', lazyloadRouteHandler('./routes/nosetime/comment'));
router.get('/nosetime/home', lazyloadRouteHandler('./routes/nosetime/home'));

// 涂鸦王国
router.get('/gracg/:user/:love?', lazyloadRouteHandler('./routes/gracg/user'));

// 大侠阿木
router.get('/daxiaamu/home', lazyloadRouteHandler('./routes/daxiaamu/home'));

// 美团技术团队
router.get('/meituan/tech/home', lazyloadRouteHandler('./routes//meituan/tech/home'));

// 码农网
router.get('/codeceo/home', lazyloadRouteHandler('./routes/codeceo/home'));
router.get('/codeceo/:type/:category?', lazyloadRouteHandler('./routes/codeceo/category'));

// BOF
router.get('/bof/home', lazyloadRouteHandler('./routes/bof/home'));

// 爱发电
router.get('/afdian/explore/:type?/:category?', lazyloadRouteHandler('./routes/afdian/explore'));
router.get('/afdian/dynamic/:uid', lazyloadRouteHandler('./routes/afdian/dynamic'));

// Simons Foundation
router.get('/simonsfoundation/articles', lazyloadRouteHandler('./routes/simonsfoundation/articles'));
router.get('/simonsfoundation/recommend', lazyloadRouteHandler('./routes/simonsfoundation/recommend'));

// 王者荣耀
// router.get('/tencent/pvp/newsindex/:type', lazyloadRouteHandler('./routes/tencent/pvp/newsindex'));

// 《明日方舟》游戏 (migrated to v2)
// router.get('/arknights/news', lazyloadRouteHandler('./routes/arknights/news'));
// アークナイツ(明日方舟日服) (migrated to v2)
// router.get('/arknights/japan', lazyloadRouteHandler('./routes/arknights/japan'));
// 塞壬唱片
router.get('/siren/news', lazyloadRouteHandler('./routes/siren/index'));

// ff14 migrated to v2
// router.get('/ff14/ff14_zh/:type', lazyloadRouteHandler('./routes/ff14/ff14_zh'));
// router.get('/ff14/ff14_global/:lang/:type', lazyloadRouteHandler('./routes/ff14/ff14_global'));

// 学堂在线
router.get('/xuetangx/course/:cid/:type', lazyloadRouteHandler('./routes/xuetangx/course_info'));
router.get('/xuetangx/course/list/:mode/:credential/:status/:type?', lazyloadRouteHandler('./routes/xuetangx/course_list'));

// wikihow
router.get('/wikihow/index', lazyloadRouteHandler('./routes/wikihow/index.js'));
router.get('/wikihow/category/:category/:type', lazyloadRouteHandler('./routes/wikihow/category.js'));

// 正版中国
router.get('/getitfree/category/:category?', lazyloadRouteHandler('./routes/getitfree/category.js'));
router.get('/getitfree/search/:keyword?', lazyloadRouteHandler('./routes/getitfree/search.js'));

// 万联网
router.get('/10000link/news/:category?', lazyloadRouteHandler('./routes/10000link/news'));

// 站酷
// router.get('/zcool/discover/:query?/:subCate?/:hasVideo?/:city?/:collage?/:recommendLevel?/:sort?', lazyloadRouteHandler('./routes/zcool/discover'));
// router.get('/zcool/recommend/:query?/:subCate?/:hasVideo?/:city?/:collage?/:recommendLevel?/:sort?', lazyloadRouteHandler('./routes/zcool/discover')); // 兼容老版本
// router.get('/zcool/top/:type', lazyloadRouteHandler('./routes/zcool/top'));
// router.get('/zcool/top', lazyloadRouteHandler('./routes/zcool/top')); // 兼容老版本
// router.get('/zcool/user/:uid', lazyloadRouteHandler('./routes/zcool/user'));

// 第一财经
// router.get('/yicai/brief', lazyloadRouteHandler('./routes/yicai/brief.js'));

// 一兜糖
router.get('/yidoutang/index', lazyloadRouteHandler('./routes/yidoutang/index.js'));
router.get('/yidoutang/guide', lazyloadRouteHandler('./routes/yidoutang/guide.js'));
router.get('/yidoutang/mtest', lazyloadRouteHandler('./routes/yidoutang/mtest.js'));
router.get('/yidoutang/case/:type', lazyloadRouteHandler('./routes/yidoutang/case.js'));

// 开眼
router.get('/kaiyan/index', lazyloadRouteHandler('./routes/kaiyan/index'));

// 龙空
// router.get('/lkong/forum/:id/:digest?', lazyloadRouteHandler('./routes/lkong/forum'));
// router.get('/lkong/thread/:id', lazyloadRouteHandler('./routes/lkong/thread'));
// router.get('/lkong/user/:id', lazyloadRouteHandler('./routes/lkong/user'));

// 坂道系列资讯
// 坂道系列官网新闻
router.get('/keyakizaka46/news', lazyloadRouteHandler('./routes/keyakizaka46/news'));
router.get('/hinatazaka46/news', lazyloadRouteHandler('./routes/hinatazaka46/news'));
router.get('/keyakizaka46/blog', lazyloadRouteHandler('./routes/keyakizaka46/blog'));
router.get('/hinatazaka46/blog', lazyloadRouteHandler('./routes/hinatazaka46/blog'));
// router.get('/sakurazaka46/blog', lazyloadRouteHandler('./routes/sakurazaka46/blog'));

// 酷安 migrated to v2
// router.get('/coolapk/tuwen/:type?', lazyloadRouteHandler('./routes/coolapk/tuwen'));
// router.get('/coolapk/tuwen-xinxian', lazyloadRouteHandler('./routes/coolapk/tuwen'));
// router.get('/coolapk/toutiao/:type?', lazyloadRouteHandler('./routes/coolapk/toutiao'));
// router.get('/coolapk/huati/:tag', lazyloadRouteHandler('./routes/coolapk/huati'));
// router.get('/coolapk/user/:uid/dynamic', lazyloadRouteHandler('./routes/coolapk/userDynamic'));
// router.get('/coolapk/dyh/:dyhId', lazyloadRouteHandler('./routes/coolapk/dyh'));
// router.get('/coolapk/hot/:type?/:period?', lazyloadRouteHandler('./routes/coolapk/hot'));

// 模型网
router.get('/moxingnet', lazyloadRouteHandler('./routes/moxingnet'));

// 湖北大学
router.get('/hubu/news/:type', lazyloadRouteHandler('./routes/universities/hubu/news'));

// 大连海事大学
router.get('/dlmu/news/:type', lazyloadRouteHandler('./routes/universities/dlmu/news'));
router.get('/dlmu/grs/zsgz/:type', lazyloadRouteHandler('./routes/universities/dlmu/grs/zsgz'));

// Rockstar Games Social Club
router.get('/socialclub/events/:game?', lazyloadRouteHandler('./routes/socialclub/events'));

// CTFHub Event Calendar
router.get('/ctfhub/upcoming/:limit?', lazyloadRouteHandler('./routes/ctfhub/upcoming'));
router.get('/ctfhub/search/:limit?/:form?/:class?/:title?', lazyloadRouteHandler('./routes/ctfhub/search'));

// 阿里云 migrated to v2
// router.get('/aliyun/database_month', lazyloadRouteHandler('./routes/aliyun/database_month'));
// router.get('/aliyun/notice/:type?', lazyloadRouteHandler('./routes/aliyun/notice'));
// router.get('/aliyun/developer/group/:type', lazyloadRouteHandler('./routes/aliyun/developer/group'));

// 礼物说
router.get('/liwushuo/index', lazyloadRouteHandler('./routes/liwushuo/index.js'));

// 故事fm
router.get('/storyfm/index', lazyloadRouteHandler('./routes/storyfm/index.js'));

// 中国日报
router.get('/chinadaily/english/:category', lazyloadRouteHandler('./routes/chinadaily/english.js'));

// leboncoin
router.get('/leboncoin/ad/:query', lazyloadRouteHandler('./routes/leboncoin/ad.js'));

// DHL
router.get('/dhl/:id', lazyloadRouteHandler('./routes/dhl/shipment-tracking'));

// Japanpost
router.get('/japanpost/track/:reqCode/:locale?', lazyloadRouteHandler('./routes/japanpost/track'));

// 中华人民共和国商务部 migrated to v2
// router.get('/mofcom/article/:suffix', lazyloadRouteHandler('./routes/mofcom/article'));

// 品玩
router.get('/pingwest/status', lazyloadRouteHandler('./routes/pingwest/status'));
router.get('/pingwest/tag/:tag/:type', lazyloadRouteHandler('./routes/pingwest/tag'));
router.get('/pingwest/user/:uid/:type?', lazyloadRouteHandler('./routes/pingwest/user'));

// Hanime
router.get('/hanime/video', lazyloadRouteHandler('./routes/hanime/video'));

// Soul
router.get('/soul/:id', lazyloadRouteHandler('./routes/soul'));
router.get('/soul/posts/hot/:pid*', lazyloadRouteHandler('./routes/soul/hot'));

// 单向空间
router.get('/owspace/read/:type?', lazyloadRouteHandler('./routes/owspace/read'));

// 天涯论坛
router.get('/tianya/index/:type', lazyloadRouteHandler('./routes/tianya/index'));
router.get('/tianya/user/:userid', lazyloadRouteHandler('./routes/tianya/user'));
router.get('/tianya/comments/:userid', lazyloadRouteHandler('./routes/tianya/comments'));

// eleme
router.get('/eleme/open/announce', lazyloadRouteHandler('./routes/eleme/open/announce'));
router.get('/eleme/open-be/announce', lazyloadRouteHandler('./routes/eleme/open-be/announce'));

// 美团开放平台
router.get('/meituan/open/announce', lazyloadRouteHandler('./routes/meituan/open/announce'));

// 微信开放社区
router.get('/wechat-open/community/:type', lazyloadRouteHandler('./routes/tencent/wechat/wechat-open/community/announce'));
// 微信支付 - 商户平台公告
router.get('/wechat-open/pay/announce', lazyloadRouteHandler('./routes/tencent/wechat/wechat-open/pay/announce'));
router.get('/wechat-open/community/:type/:category', lazyloadRouteHandler('./routes/tencent/wechat/wechat-open/community/question'));

// 微店
router.get('/weidian/goods/:id', lazyloadRouteHandler('./routes/weidian/goods'));

// 有赞
router.get('/youzan/goods/:id', lazyloadRouteHandler('./routes/youzan/goods'));

// 币世界快讯
router.get('/bishijie/kuaixun', lazyloadRouteHandler('./routes/bishijie/kuaixun'));

// 顺丰丰桥
router.get('/sf/sffq-announce', lazyloadRouteHandler('./routes/sf/sffq-announce'));

// 缺书网
router.get('/queshu/sale', lazyloadRouteHandler('./routes/queshu/sale'));
router.get('/queshu/book/:bookid', lazyloadRouteHandler('./routes/queshu/book'));

// MITRE
router.get('/mitre/publications', lazyloadRouteHandler('./routes/mitre/publications'));

// SANS
router.get('/sans/summit_archive', lazyloadRouteHandler('./routes/sans/summit_archive'));

// LaTeX 开源小屋
router.get('/latexstudio/home', lazyloadRouteHandler('./routes/latexstudio/home'));

// 上证债券信息网 - 可转换公司债券公告
// router.get('/sse/convert/:query?', lazyloadRouteHandler('./routes/sse/convert'));
// router.get('/sse/renewal', lazyloadRouteHandler('./routes/sse/renewal'));
// router.get('/sse/inquire', lazyloadRouteHandler('./routes/sse/inquire'));

// 上海证券交易所
// router.get('/sse/disclosure/:query?', lazyloadRouteHandler('./routes/sse/disclosure'));

// 深圳证券交易所
// router.get('/szse/notice', lazyloadRouteHandler('./routes/szse/notice'));
// router.get('/szse/inquire/:type', lazyloadRouteHandler('./routes/szse/inquire'));
// router.get('/szse/projectdynamic/:type?/:stage?/:status?', lazyloadRouteHandler('./routes/szse/projectdynamic'));

// 前端艺术家每日整理&&飞冰早报
router.get('/jskou/:type?', lazyloadRouteHandler('./routes/jskou/index'));

// 国家应急广播
router.get('/cneb/yjxx', lazyloadRouteHandler('./routes/cneb/yjxx'));
router.get('/cneb/guoneinews', lazyloadRouteHandler('./routes/cneb/guoneinews'));

// 邮箱
router.get('/mail/imap/:email', lazyloadRouteHandler('./routes/mail/imap'));

// 好队友
router.get('/network360/jobs', lazyloadRouteHandler('./routes/network360/jobs'));

// 智联招聘
router.get('/zhilian/:city/:keyword', lazyloadRouteHandler('./routes/zhilian/index'));

// 电鸭社区
// router.get('/eleduck/jobs', lazyloadRouteHandler('./routes/eleduck/jobs'));

// 北华航天工业学院 - 新闻
router.get('/nciae/news', lazyloadRouteHandler('./routes/universities/nciae/news'));

// 北华航天工业学院 - 通知公告
router.get('/nciae/tzgg', lazyloadRouteHandler('./routes/universities/nciae/tzgg'));

// 北华航天工业学院 - 学术信息
router.get('/nciae/xsxx', lazyloadRouteHandler('./routes/universities/nciae/xsxx'));

// cfan
router.get('/cfan/news', lazyloadRouteHandler('./routes/cfan/news'));

// 腾讯企鹅号
router.get('/tencent/news/author/:mid', lazyloadRouteHandler('./routes/tencent/news/author'));

// 奈菲影视
router.get('/nfmovies/:id?', lazyloadRouteHandler('./routes/nfmovies/index'));

// 书友社区
router.get('/andyt/:view?', lazyloadRouteHandler('./routes/andyt/index'));

// 品途商业评论
router.get('/pintu360/:type?', lazyloadRouteHandler('./routes/pintu360/index'));

// engadget中国版
router.get('/engadget-cn', lazyloadRouteHandler('./routes/engadget/home'));

// engadget
router.get('/engadget/:lang?', lazyloadRouteHandler('./routes/engadget/home'));

// 吹牛部落
router.get('/chuiniu/column/:id', lazyloadRouteHandler('./routes/chuiniu/column'));
router.get('/chuiniu/column_list', lazyloadRouteHandler('./routes/chuiniu/column_list'));

// leemeng
router.get('/leemeng', lazyloadRouteHandler('./routes/blogs/leemeng'));

// 中国地质大学（武汉）
router.get('/cug/graduate', lazyloadRouteHandler('./routes/universities/cug/graduate'));
router.get('/cug/undergraduate', lazyloadRouteHandler('./routes/universities/cug/undergraduate'));
router.get('/cug/xgxy', lazyloadRouteHandler('./routes/universities/cug/xgxy'));
router.get('/cug/news', lazyloadRouteHandler('./routes/universities/cug/news'));
router.get('/cug/gcxy/:type?', lazyloadRouteHandler('./routes/universities/cug/gcxy/index'));

// 海猫吧
router.get('/haimaoba/:id?', lazyloadRouteHandler('./routes/haimaoba/comics'));

// 蒲公英
router.get('/pgyer/:app?', lazyloadRouteHandler('./routes/pgyer/app'));

// 微博个人时间线
// router.get('/weibo/timeline/:uid/:feature?/:routeParams?', lazyloadRouteHandler('./routes/weibo/timeline'));

// TAPTAP migrated to v2
// router.get('/taptap/topic/:id/:label?', lazyloadRouteHandler('./routes/taptap/topic'));
// router.get('/taptap/changelog/:id', lazyloadRouteHandler('./routes/taptap/changelog'));
// router.get('/taptap/review/:id/:order?/:lang?', lazyloadRouteHandler('./routes/taptap/review'));

// lofter migrated to v2
// router.get('/lofter/tag/:name?/:type?', lazyloadRouteHandler('./routes/lofter/tag'));
// router.get('/lofter/user/:name?', lazyloadRouteHandler('./routes/lofter/user'));

// 米坛社区表盘
router.get('/watchface/:watch_type?/:list_type?', lazyloadRouteHandler('./routes/watchface/update'));

// CNU视觉联盟
router.get('/cnu/selected', lazyloadRouteHandler('./routes/cnu/selected'));
router.get('/cnu/discovery/:type?/:category?', lazyloadRouteHandler('./routes/cnu/discovery'));

// 战旗直播
router.get('/zhanqi/room/:id', lazyloadRouteHandler('./routes/zhanqi/room'));

// 酒云网
router.get('/wineyun/:category', lazyloadRouteHandler('./routes/wineyun'));

// 小红书 migrated to v2
// router.get('/xiaohongshu/user/:user_id/:category', lazyloadRouteHandler('./routes/xiaohongshu/user'));
// router.get('/xiaohongshu/board/:board_id', lazyloadRouteHandler('./routes/xiaohongshu/board'));

// 每经网
// router.get('/nbd/daily', lazyloadRouteHandler('./routes/nbd/article'));
// router.get('/nbd/:id?', lazyloadRouteHandler('./routes/nbd/index'));

// 快知
router.get('/kzfeed/topic/:id', lazyloadRouteHandler('./routes/kzfeed/topic'));

// 腾讯新闻较真查证平台
// router.get('/factcheck', lazyloadRouteHandler('./routes/tencent/factcheck'));

// X-MOL化学资讯平台
router.get('/x-mol/news/:tag?', lazyloadRouteHandler('./routes/x-mol/news.js'));
router.get('/x-mol/paper/:type/:magazine', lazyloadRouteHandler('./routes/x-mol/paper'));

// 知识分子
router.get('/zhishifenzi/news/:type?', lazyloadRouteHandler('./routes/zhishifenzi/news'));
router.get('/zhishifenzi/depth', lazyloadRouteHandler('./routes/zhishifenzi/depth'));
router.get('/zhishifenzi/innovation/:type?', lazyloadRouteHandler('./routes/zhishifenzi/innovation'));

// 電撃Online
router.get('/dengekionline/:type?', lazyloadRouteHandler('./routes/dengekionline/new'));

// 4Gamers
router.get('/4gamers/category/:category', lazyloadRouteHandler('./routes/4gamers/category'));
router.get('/4gamers/tag/:tag', lazyloadRouteHandler('./routes/4gamers/tag'));
router.get('/4gamers/topic/:topic', lazyloadRouteHandler('./routes/4gamers/topic'));

// 大麦网
router.get('/damai/activity/:city/:category/:subcategory/:keyword?', lazyloadRouteHandler('./routes/damai/activity'));

// 桂林电子科技大学新闻资讯
router.get('/guet/xwzx/:type?', lazyloadRouteHandler('./routes/guet/news'));

// はてな匿名ダイアリー
router.get('/hatena/anonymous_diary/archive', lazyloadRouteHandler('./routes/hatena/anonymous_diary/archive'));

// kaggle
router.get('/kaggle/discussion/:forumId/:sort?', lazyloadRouteHandler('./routes/kaggle/discussion'));
router.get('/kaggle/competitions/:category?', lazyloadRouteHandler('./routes/kaggle/competitions'));
router.get('/kaggle/user/:user', lazyloadRouteHandler('./routes/kaggle/user'));

// PubMed Trending
// router.get('/pubmed/trending', lazyloadRouteHandler('./routes/pubmed/trending'));

// 领科 (linkresearcher.com)
// router.get('/linkresearcher/:params', lazyloadRouteHandler('./routes/linkresearcher/index'));

// eLife [Sci Journal]
router.get('/elife/:tid', lazyloadRouteHandler('./routes/elife/index'));

// IEEE Xplore [Sci Journal]
router.get('/ieee/author/:aid/:sortType/:count?', lazyloadRouteHandler('./routes/ieee/author'));

// PNAS [Sci Journal]
// router.get('/pnas/:topic?', lazyloadRouteHandler('./routes/pnas/index'));

// cell [Sci Journal]
router.get('/cell/cell/:category', lazyloadRouteHandler('./routes/cell/cell/index'));
router.get('/cell/cover', lazyloadRouteHandler('./routes/cell/cover'));

// nature + nature 子刊 [Sci Journal] migrated to v2
// router.get('/nature/research/:journal?', lazyloadRouteHandler('./routes/nature/research'));
// router.get('/nature/news-and-comment/:journal?', lazyloadRouteHandler('./routes/nature/news-and-comment'));
// router.get('/nature/cover', lazyloadRouteHandler('./routes/nature/cover'));
// router.get('/nature/news', lazyloadRouteHandler('./routes/nature/news'));
// router.get('/nature/highlight/:year?', lazyloadRouteHandler('./routes/nature/highlight'));

// science [Sci Journal]
// router.get('/sciencemag/current/:journal?', lazyloadRouteHandler('./routes/sciencemag/current'));
// router.get('/sciencemag/cover', lazyloadRouteHandler('./routes/sciencemag/cover'));
// router.get('/sciencemag/early/science', lazyloadRouteHandler('./routes/sciencemag/early'));

// dlsite
// router.get('/dlsite/new/:type', lazyloadRouteHandler('./routes/dlsite/new'));
// router.get('/dlsite/campaign/:type/:free?', lazyloadRouteHandler('./routes/dlsite/campaign'));

// mcbbs
router.get('/mcbbs/forum/:type', lazyloadRouteHandler('./routes/mcbbs/forum'));
router.get('/mcbbs/post/:tid/:authorid?', lazyloadRouteHandler('./routes/mcbbs/post'));

// Pocket
router.get('/pocket/trending', lazyloadRouteHandler('./routes/pocket/trending'));

// HK01
// router.get('/hk01/zone/:id', lazyloadRouteHandler('./routes/hk01/zone'));
// router.get('/hk01/channel/:id', lazyloadRouteHandler('./routes/hk01/channel'));
// router.get('/hk01/issue/:id', lazyloadRouteHandler('./routes/hk01/issue'));
// router.get('/hk01/tag/:id', lazyloadRouteHandler('./routes/hk01/tag'));
// router.get('/hk01/hot', lazyloadRouteHandler('./routes/hk01/hot'));

// 码农周刊
router.get('/manong-weekly', lazyloadRouteHandler('./routes/manong-weekly/issues'));

// 每日猪价
router.get('/pork-price', lazyloadRouteHandler('./routes/pork-price'));

// NOI 全国青少年信息学奥林匹克竞赛
router.get('/noi', lazyloadRouteHandler('./routes/noi'));
router.get('/noi/winners-list', lazyloadRouteHandler('./routes/noi/winners-list'));
router.get('/noi/province-news', lazyloadRouteHandler('./routes/noi/province-news'));
router.get('/noi/rg-news', lazyloadRouteHandler('./routes/noi/rg-news'));

// 中国国家认证认可监管管理员会
router.get('/gov/cnca/jgdt', lazyloadRouteHandler('./routes/gov/cnca/jgdt'));
router.get('/gov/cnca/hydt', lazyloadRouteHandler('./routes/gov/cnca/hydt'));

router.get('/gov/cnca/zxtz', lazyloadRouteHandler('./routes/gov/cnca/zxtz'));

// clickme
// router.get('/clickme/:site/:grouping/:name', lazyloadRouteHandler('./routes/clickme'));

// 文汇报
router.get('/whb/:category', lazyloadRouteHandler('./routes/whb/zhuzhan'));

// 三界异次元
router.get('/3ycy/home', lazyloadRouteHandler('./routes/3ycy/home.js'));

// Emi Nitta official website
router.get('/emi-nitta/:type', lazyloadRouteHandler('./routes/emi-nitta/home'));

// Alter China
router.get('/alter-cn/news', lazyloadRouteHandler('./routes/alter-cn/news'));

// Visual Studio Code Marketplace
router.get('/vscode/marketplace/:type?', lazyloadRouteHandler('./routes/vscode/marketplace'));

// 饭否
router.get('/fanfou/user_timeline/:uid', lazyloadRouteHandler('./routes/fanfou/user_timeline'));
router.get('/fanfou/home_timeline', lazyloadRouteHandler('./routes/fanfou/home_timeline'));
router.get('/fanfou/favorites/:uid', lazyloadRouteHandler('./routes/fanfou/favorites'));
router.get('/fanfou/trends', lazyloadRouteHandler('./routes/fanfou/trends'));
router.get('/fanfou/public_timeline/:keyword', lazyloadRouteHandler('./routes/fanfou/public_timeline'));

// ITSlide
router.get('/itslide/new', lazyloadRouteHandler('./routes/itslide/new'));

// Remote Work
router.get('/remote-work/:caty?', lazyloadRouteHandler('./routes/remote-work/index'));

// China Times
router.get('/chinatimes/:caty', lazyloadRouteHandler('./routes/chinatimes/index'));

// TransferWise
// router.get('/transferwise/pair/:source/:target', lazyloadRouteHandler('./routes/transferwise/pair'));

// chocolatey
router.get('/chocolatey/software/:name?', lazyloadRouteHandler('./routes/chocolatey/software'));

// Nyaa migrated to v2
// router.get('/nyaa/search/:query?', lazyloadRouteHandler('./routes/nyaa/search'));

// 片源网 migrated to v2
// router.get('/pianyuan/index/:media?', lazyloadRouteHandler('./routes/pianyuan/app'));
// router.get('/pianyuan/indexers/pianyuan/results/search/api', lazyloadRouteHandler('./routes/pianyuan/search'));

// 巴哈姆特
router.get('/bahamut/creation/:author/:category?', lazyloadRouteHandler('./routes/bahamut/creation'));
router.get('/bahamut/creation_index/:category?/:subcategory?/:type?', lazyloadRouteHandler('./routes/bahamut/creation_index'));

// CentBrowser
router.get('/centbrowser/history', lazyloadRouteHandler('./routes/centbrowser/history'));

// 755
router.get('/755/user/:username', lazyloadRouteHandler('./routes/755/user'));

// IKEA
// router.get('/ikea/uk/new', lazyloadRouteHandler('./routes/ikea/uk/new'));
// router.get('/ikea/uk/offer', lazyloadRouteHandler('./routes/ikea/uk/offer'));

// Mastodon
router.get('/mastodon/timeline/:site/:only_media?', lazyloadRouteHandler('./routes/mastodon/timeline_local'));
router.get('/mastodon/remote/:site/:only_media?', lazyloadRouteHandler('./routes/mastodon/timeline_remote'));
router.get('/mastodon/account_id/:site/:account_id/statuses/:only_media?', lazyloadRouteHandler('./routes/mastodon/account_id'));
router.get('/mastodon/acct/:acct/statuses/:only_media?', lazyloadRouteHandler('./routes/mastodon/acct'));

// Kernel Aliyun
router.get('/aliyun-kernel/index', lazyloadRouteHandler('./routes/aliyun-kernel/index'));

// Vulture
router.get('/vulture/:tag/:excludetags?', lazyloadRouteHandler('./routes/vulture/index'));

// xinwenlianbo
router.get('/xinwenlianbo/index', lazyloadRouteHandler('./routes/xinwenlianbo/index'));

// Paul Graham - Essays
router.get('/blogs/paulgraham', lazyloadRouteHandler('./routes/blogs/paulgraham'));

// invisionapp
router.get('/invisionapp/inside-design', lazyloadRouteHandler('./routes/invisionapp/inside-design'));

// mlog.club
router.get('/mlog-club/topics/:node', lazyloadRouteHandler('./routes/mlog-club/topics'));
router.get('/mlog-club/projects', lazyloadRouteHandler('./routes/mlog-club/projects'));

// Chrome 网上应用店
router.get('/chrome/webstore/extensions/:id', lazyloadRouteHandler('./routes/chrome/extensions'));

// RTHK
router.get('/rthk-news/:lang/:category', lazyloadRouteHandler('./routes/rthk-news/index'));

// yahoo
// router.get('/yahoo-news/:region/:category?', lazyloadRouteHandler('./routes/yahoo-news/index'));

// Yahoo!テレビ
router.get('/yahoo-jp-tv/:query', lazyloadRouteHandler('./routes/yahoo-jp-tv/index'));

// Yahoo! by Author
router.get('/yahoo-author/:author', lazyloadRouteHandler('./routes/yahoo-author/index'));

// 白鲸出海
// router.get('/baijing', lazyloadRouteHandler('./routes/baijing'));

// 低端影视
router.get('/ddrk/update/:name/:season?', lazyloadRouteHandler('./routes/ddrk/index'));
router.get('/ddrk/tag/:tag', lazyloadRouteHandler('./routes/ddrk/list'));
router.get('/ddrk/category/:category', lazyloadRouteHandler('./routes/ddrk/list'));
router.get('/ddrk/index', lazyloadRouteHandler('./routes/ddrk/list'));

// avgle
router.get('/avgle/videos/:order?/:time?/:top?', lazyloadRouteHandler('./routes/avgle/videos.js'));
router.get('/avgle/search/:keyword/:order?/:time?/:top?', lazyloadRouteHandler('./routes/avgle/videos.js'));

// 公主链接公告
router.get('/pcr/news', lazyloadRouteHandler('./routes/pcr/news'));
router.get('/pcr/news-tw', lazyloadRouteHandler('./routes/pcr/news-tw'));
router.get('/pcr/news-cn', lazyloadRouteHandler('./routes/pcr/news-cn'));

// project-zero issues
router.get('/project-zero-issues', lazyloadRouteHandler('./routes/project-zero-issues/index'));

// 平安银河实验室
router.get('/galaxylab', lazyloadRouteHandler('./routes/galaxylab/index'));

// NOSEC 安全讯息平台
router.get('/nosec/:keykind?', lazyloadRouteHandler('./routes/nosec/index'));

// Hex-Rays News migrated to v2
// router.get('/hex-rays/news', lazyloadRouteHandler('./routes/hex-rays/index'));

// 新趣集
router.get('/xinquji/today', lazyloadRouteHandler('./routes/xinquji/today'));
router.get('/xinquji/today/internal', lazyloadRouteHandler('./routes/xinquji/internal'));

// 英中协会
router.get('/gbcc/trust', lazyloadRouteHandler('./routes/gbcc/trust'));

// Associated Press
// router.get('/apnews/topics/:topic', lazyloadRouteHandler('./routes/apnews/topics'));

// CBC
router.get('/cbc/topics/:topic?', lazyloadRouteHandler('./routes/cbc/topics'));

// discuz
router.get('/discuz/:ver([7|x])/:cid([0-9]{2})/:link(.*)', lazyloadRouteHandler('./routes/discuz/discuz'));
router.get('/discuz/:ver([7|x])/:link(.*)', lazyloadRouteHandler('./routes/discuz/discuz'));
router.get('/discuz/:link(.*)', lazyloadRouteHandler('./routes/discuz/discuz'));

// China Dialogue 中外对话
router.get('/chinadialogue/topics/:topic', lazyloadRouteHandler('./routes/chinadialogue/topics'));
router.get('/chinadialogue/:column', lazyloadRouteHandler('./routes/chinadialogue/column'));

// 人民日报社 国际金融报
router.get('/ifnews/:cid', lazyloadRouteHandler('./routes/ifnews/column'));

// Scala Blog
router.get('/scala/blog/:part?', lazyloadRouteHandler('./routes/scala-blog/scala-blog'));

// Minecraft Java版游戏更新
// router.get('/minecraft/version', lazyloadRouteHandler('./routes/minecraft/version'));

// 微信更新日志
router.get('/weixin/miniprogram/release', lazyloadRouteHandler('./routes/tencent/wechat/miniprogram/framework')); // 基础库更新日志
router.get('/weixin/miniprogram/framework', lazyloadRouteHandler('./routes/tencent/wechat/miniprogram/framework')); // 基础库更新日志
router.get('/weixin/miniprogram/devtools', lazyloadRouteHandler('./routes/tencent/wechat/miniprogram/devtools')); // 开发者工具更新日志
router.get('/weixin/miniprogram/wxcloud/:caty?', lazyloadRouteHandler('./routes/tencent/wechat/miniprogram/wxcloud')); // 云开发更新日志

// 新冠肺炎疫情动态
router.get('/coronavirus/caixin', lazyloadRouteHandler('./routes/coronavirus/caixin'));
router.get('/coronavirus/dxy/data/:province?/:city?', lazyloadRouteHandler('./routes/coronavirus/dxy-data'));
router.get('/coronavirus/dxy', lazyloadRouteHandler('./routes/coronavirus/dxy'));
router.get('/coronavirus/scmp', lazyloadRouteHandler('./routes/coronavirus/scmp'));
router.get('/coronavirus/nhc', lazyloadRouteHandler('./routes/coronavirus/nhc'));
router.get('/coronavirus/mogov-2019ncov/:lang', lazyloadRouteHandler('./routes/coronavirus/mogov-2019ncov'));
router.get('/coronavirus/qq/fact', lazyloadRouteHandler('./routes/tencent/factcheck'));
router.get('/coronavirus/sg-moh', lazyloadRouteHandler('./routes/coronavirus/sg-moh'));
router.get('/coronavirus/yahoo-japan/:tdfk?', lazyloadRouteHandler('./routes/coronavirus/yahoo-japan'));

// 南京林业大学教务处
router.get('/njfu/jwc/:category?', lazyloadRouteHandler('./routes/universities/njfu/jwc'));

// 日本経済新聞
// router.get('/nikkei/index', lazyloadRouteHandler('./routes/nikkei/index'));
// router.get('/nikkei/:category/:article_type?', lazyloadRouteHandler('./routes/nikkei/news'));

// MQube
router.get('/mqube/user/:user', lazyloadRouteHandler('./routes/mqube/user'));
router.get('/mqube/tag/:tag', lazyloadRouteHandler('./routes/mqube/tag'));
router.get('/mqube/latest', lazyloadRouteHandler('./routes/mqube/latest'));
router.get('/mqube/top', lazyloadRouteHandler('./routes/mqube/top'));

// Letterboxd
router.get('/letterboxd/user/diary/:username', lazyloadRouteHandler('./routes/letterboxd/userdiary'));
router.get('/letterboxd/user/followingdiary/:username', lazyloadRouteHandler('./routes/letterboxd/followingdiary'));

// javlibrary
// router.get('/javlibrary/users/:uid/:utype', lazyloadRouteHandler('./routes/javlibrary/users'));
// router.get('/javlibrary/videos/:vtype', lazyloadRouteHandler('./routes/javlibrary/videos'));
// router.get('/javlibrary/stars/:sid', lazyloadRouteHandler('./routes/javlibrary/stars'));
// router.get('/javlibrary/bestreviews', lazyloadRouteHandler('./routes/javlibrary/bestreviews'));

// Last.FM
router.get('/lastfm/recent/:user', lazyloadRouteHandler('./routes/lastfm/recent'));
router.get('/lastfm/loved/:user', lazyloadRouteHandler('./routes/lastfm/loved'));
router.get('/lastfm/top/:country?', lazyloadRouteHandler('./routes/lastfm/top'));

// piapro
router.get('/piapro/user/:pid', lazyloadRouteHandler('./routes/piapro/user'));
router.get('/piapro/public/:type/:tag?/:category?', lazyloadRouteHandler('./routes/piapro/public'));

// 凤凰网 migrated to v2
// router.get('/ifeng/feng/:id/:type', lazyloadRouteHandler('./routes/ifeng/feng'));

// 第一版主
router.get('/novel/d1bz/:category/:id', lazyloadRouteHandler('./routes/d1bz/novel'));

// 爱下电子书
router.get('/axdzs/:novel', lazyloadRouteHandler('./routes/novel/axdzs'));
// deprecated
router.get('/axdzs/:id1/:id2', lazyloadRouteHandler('./routes/novel/axdzs'));

// HackerOne
router.get('/hackerone/hacktivity', lazyloadRouteHandler('./routes/hackerone/hacktivity'));
router.get('/hackerone/search/:search', lazyloadRouteHandler('./routes/hackerone/search'));

// 奶牛关
router.get('/cowlevel/element/:id', lazyloadRouteHandler('./routes/cowlevel/element'));

// 2048
// router.get('/2048/bbs/:fid', lazyloadRouteHandler('./routes/2048/bbs'));

// Google News
// router.get('/google/news/:category/:locale', lazyloadRouteHandler('./routes/google/news'));

// 虛詞
router.get('/p-articles/section/:section', lazyloadRouteHandler('./routes/p-articles/section'));
router.get('/p-articles/contributors/:author', lazyloadRouteHandler('./routes/p-articles/contributors'));

// finviz

// router.get('/finviz/news/:ticker', lazyloadRouteHandler('./routes/finviz/news'));

// 好好住
router.get('/haohaozhu/whole-house/:keyword?', lazyloadRouteHandler('./routes/haohaozhu/whole-house'));
router.get('/haohaozhu/discover/:keyword?', lazyloadRouteHandler('./routes/haohaozhu/discover'));

// 东北大学
// router.get('/neu/news/:type', lazyloadRouteHandler('./routes/universities/neu/news'));

// 快递100
// router.get('/kuaidi100/track/:number/:id/:phone?', lazyloadRouteHandler('./routes/kuaidi100/index'));
// router.get('/kuaidi100/company', lazyloadRouteHandler('./routes/kuaidi100/supported_company'));

// 稻草人书屋
router.get('/dcrsw/:name/:count?', lazyloadRouteHandler('./routes/novel/dcrsw'));

// 魔法纪录
router.get('/magireco/announcements', lazyloadRouteHandler('./routes/magireco/announcements'));
router.get('/magireco/event_banner', lazyloadRouteHandler('./routes/magireco/event_banner'));

// wolley
router.get('/wolley', lazyloadRouteHandler('./routes/wolley/index'));
router.get('/wolley/user/:id', lazyloadRouteHandler('./routes/wolley/user'));
router.get('/wolley/host/:host', lazyloadRouteHandler('./routes/wolley/host'));

// 西安交大
// router.get('/xjtu/gs/tzgg', lazyloadRouteHandler('./routes/universities/xjtu/gs/tzgg'));
// router.get('/xjtu/dean/:subpath+', lazyloadRouteHandler('./routes/universities/xjtu/dean'));
// router.get('/xjtu/international/:subpath+', lazyloadRouteHandler('./routes/universities/xjtu/international'));
// router.get('/xjtu/job/:subpath?', lazyloadRouteHandler('./routes/universities/xjtu/job'));
// router.get('/xjtu/ee/:id?', lazyloadRouteHandler('./routes/universities/xjtu/ee'));

// booksource
router.get('/booksource', lazyloadRouteHandler('./routes/booksource/index'));

// ku
router.get('/ku/:name?', lazyloadRouteHandler('./routes/ku/index'));

// 我有一片芝麻地
router.get('/blogs/hedwig/:type', lazyloadRouteHandler('./routes/blogs/hedwig'));

// LoveHeaven
router.get('/loveheaven/update/:slug', lazyloadRouteHandler('./routes/loveheaven/update'));

// 拉勾
router.get('/lagou/jobs/:position/:city', lazyloadRouteHandler('./routes/lagou/jobs'));

// 扬州大学
router.get('/yzu/home/:type', lazyloadRouteHandler('./routes/universities/yzu/home'));
router.get('/yzu/yjszs/:type', lazyloadRouteHandler('./routes/universities/yzu/yjszs'));

// 德国新闻社卫健新闻
router.get('/krankenkassen', lazyloadRouteHandler('./routes/krankenkassen'));

// 桂林航天工业学院
router.get('/guat/news/:type?', lazyloadRouteHandler('./routes/guat/news'));

// NEEA
// router.get('/neea/:type', lazyloadRouteHandler('./routes/neea'));

// 中国农业大学
router.get('/cauyjs', lazyloadRouteHandler('./routes/universities/cauyjs/cauyjs'));

// 南方科技大学
router.get('/sustyjs', lazyloadRouteHandler('./routes/universities/sustyjs/sustyjs'));
router.get('/sustech/newshub-zh', lazyloadRouteHandler('./routes/universities/sustech/newshub-zh'));
router.get('/sustech/bidding', lazyloadRouteHandler('./routes/universities/sustech/bidding'));

// 广州航海学院
router.get('/gzmtu/jwc', lazyloadRouteHandler('./routes/universities/gzmtu/jwc'));
router.get('/gzmtu/tsg', lazyloadRouteHandler('./routes/universities/gzmtu/tsg'));

// 广州大学
router.get('/gzyjs', lazyloadRouteHandler('./routes/universities/gzyjs/gzyjs'));

// 暨南大学
router.get('/jnu/xysx/:type', lazyloadRouteHandler('./routes/universities/jnu/xysx/index'));
router.get('/jnu/yw/:type?', lazyloadRouteHandler('./routes/universities/jnu/yw/index'));

// 深圳大学
router.get('/szuyjs', lazyloadRouteHandler('./routes/universities/szuyjs/szuyjs'));

// 中国传媒大学
router.get('/cucyjs', lazyloadRouteHandler('./routes/universities/cucyjs/cucyjs'));

// 中国农业大学信电学院
router.get('/cauele', lazyloadRouteHandler('./routes/universities/cauyjs/cauyjs'));

// moxingfans
router.get('/moxingfans', lazyloadRouteHandler('./routes/moxingfans'));

// Chiphell
router.get('/chiphell/forum/:forumId?', lazyloadRouteHandler('./routes/chiphell/forum'));

// 华东理工大学研究生院
router.get('/ecustyjs', lazyloadRouteHandler('./routes/universities/ecustyjs/ecustyjs'));

// 同济大学研究生院
router.get('/tjuyjs', lazyloadRouteHandler('./routes/universities/tjuyjs/tjuyjs'));

// 中国石油大学研究生院
router.get('/upcyjs', lazyloadRouteHandler('./routes/universities/upcyjs/upcyjs'));

// 中国海洋大学研究生院
router.get('/outyjs', lazyloadRouteHandler('./routes/universities/outyjs/outyjs'));

// 中科院人工智能所
router.get('/zkyai', lazyloadRouteHandler('./routes/universities/zkyai/zkyai'));

// 中科院自动化所
router.get('/zkyyjs', lazyloadRouteHandler('./routes/universities/zkyyjs/zkyyjs'));

// 中国海洋大学信电学院
router.get('/outele', lazyloadRouteHandler('./routes/universities/outele/outele'));

// 华东师范大学研究生院 migrated to v2
// router.get('/ecnuyjs', lazyloadRouteHandler('./routes/universities/ecnuyjs/ecnuyjs'));

// 考研帮调剂信息
router.get('/kaoyan', lazyloadRouteHandler('./routes/kaoyan/kaoyan'));

// 华中科技大学研究生院
router.get('/hustyjs', lazyloadRouteHandler('./routes/universities/hustyjs/hustyjs'));

// 华中师范大学研究生院
router.get('/ccnuyjs', lazyloadRouteHandler('./routes/universities/ccnu/ccnuyjs'));

// 华中师范大学计算机学院
router.get('/ccnucs', lazyloadRouteHandler('./routes/universities/ccnu/ccnucs'));

// 华中师范大学伍论贡学院
router.get('/ccnuwu', lazyloadRouteHandler('./routes/universities/ccnu/ccnuwu'));

// WEEX
router.get('/weexcn/news/:typeid', lazyloadRouteHandler('./routes/weexcn/index'));

// 天天基金 migrated to v2
// router.get('/eastmoney/ttjj/user/:uid', lazyloadRouteHandler('./routes/eastmoney/ttjj/user'));

// 紳士漫畫
// router.get('/ssmh', lazyloadRouteHandler('./routes/ssmh'));
// router.get('/ssmh/category/:cid', lazyloadRouteHandler('./routes/ssmh/category'));

// 华南师范大学研究生学院
router.get('/scnuyjs', lazyloadRouteHandler('./routes/universities/scnu/scnuyjs'));

// 华南师范大学软件学院
router.get('/scnucs', lazyloadRouteHandler('./routes/universities/scnu/scnucs'));

// 华南理工大学研究生院
router.get('/scutyjs', lazyloadRouteHandler('./routes/universities/scut/scutyjs'));

// 华南农业大学研究生院通知公告
router.get('/scauyjs', lazyloadRouteHandler('./routes/universities/scauyjs/scauyjs'));

// 北京大学研究生招生网通知公告 migrated to v2
// router.get('/pkuyjs', lazyloadRouteHandler('./routes/universities/pku/pkuyjs'));

// 北京理工大学研究生通知公告
router.get('/bityjs', lazyloadRouteHandler('./routes/universities/bit/bityjs'));

// 湖南科技大学教务处
router.get('/hnust/jwc', lazyloadRouteHandler('./routes/universities/hnust/jwc/index'));
router.get('/hnust/computer', lazyloadRouteHandler('./routes/universities/hnust/computer/index'));
router.get('/hnust/art', lazyloadRouteHandler('./routes/universities/hnust/art/index'));
router.get('/hnust/chem', lazyloadRouteHandler('./routes/universities/hnust/chem/index'));
router.get('/hnust/graduate/:type?', lazyloadRouteHandler('./routes/universities/hnust/graduate/index'));

// AGE动漫
// router.get('/agefans/detail/:id', lazyloadRouteHandler('./routes/agefans/detail'));
// router.get('/agefans/update', lazyloadRouteHandler('./routes/agefans/update'));

// Checkra1n
router.get('/checkra1n/releases', lazyloadRouteHandler('./routes/checkra1n/releases'));

// 四川省科学技术厅
router.get('/sckjt/news/:type?', lazyloadRouteHandler('./routes/sckjt/news'));

// 绝对领域
router.get('/jdlingyu/:type', lazyloadRouteHandler('./routes/jdlingyu/index'));

// Hi, DIYgod
router.get('/blogs/diygod/animal-crossing', lazyloadRouteHandler('./routes/blogs/diygod/animal-crossing'));
router.get('/blogs/diygod/gk', lazyloadRouteHandler('./routes/blogs/diygod/gk'));

// 湖北工业大学
router.get('/hbut/news/:type', lazyloadRouteHandler('./routes/universities/hbut/news'));
router.get('/hbut/cs/:type', lazyloadRouteHandler('./routes/universities/hbut/cs'));

// acwifi
router.get('/acwifi', lazyloadRouteHandler('./routes/acwifi'));

// MIT科技评论
router.get('/mittrchina/:type', lazyloadRouteHandler('./routes/mittrchina'));

// iYouPort
router.get('/iyouport/article', lazyloadRouteHandler('./routes/iyouport'));
router.get('/iyouport/:category?', lazyloadRouteHandler('./routes/iyouport'));

// girlimg
router.get('/girlimg/album/:tag?/:mode?', lazyloadRouteHandler('./routes/girlimg/album'));

// etoland
router.get('/etoland/:bo_table', lazyloadRouteHandler('./routes/etoland/board'));

// 辽宁工程技术大学教务在线公告
router.get('/lntu/jwnews', lazyloadRouteHandler('./routes/universities/lntu/jwnews'));

// 51voa
router.get('/51voa/:channel', lazyloadRouteHandler('./routes/51voa/channel'));

// 追新番
router.get('/fanxinzhui', lazyloadRouteHandler('./routes/fanxinzhui/latest'));
router.get('/zhuixinfan/list', lazyloadRouteHandler('./routes/fanxinzhui/latest'));

// scoresaber
router.get('/scoresaber/user/:id', lazyloadRouteHandler('./routes/scoresaber/user'));

// blur-studio
router.get('/blur-studio', lazyloadRouteHandler('./routes/blur-studio/index'));

// method-studios
router.get('/method-studios/:menu?', lazyloadRouteHandler('./routes/method-studios/index'));

// blow-studio
router.get('/blow-studio', lazyloadRouteHandler('./routes/blow-studio/work'));

// axis-studios
router.get('/axis-studios/:type/:tag?', lazyloadRouteHandler('./routes/axis-studios/work'));

// 人民邮电出版社
router.get('/ptpress/book/:type?', lazyloadRouteHandler('./routes/ptpress/book'));

// uniqlo styling book
router.get('/uniqlo/stylingbook/:category?', lazyloadRouteHandler('./routes/uniqlo/stylingbook'));

// 本地宝焦点资讯
// router.get('/bendibao/news/:city', lazyloadRouteHandler('./routes/bendibao/news'));

// unit-image
router.get('/unit-image/films/:type?', lazyloadRouteHandler('./routes/unit-image/films'));

// digic-picture
router.get('/digic-pictures/:menu/:tags?', lazyloadRouteHandler('./routes/digic-pictures/index'));

// cve.mitre.org
router.get('/cve/search/:keyword', lazyloadRouteHandler('./routes/cve/search'));

// Xposed Module Repository
router.get('/xposed/module/:mod', lazyloadRouteHandler('./routes/xposed/module'));

// Microsoft Edge
router.get('/edge/addon/:crxid', lazyloadRouteHandler('./routes/edge/addon'));

// Microsoft Store
router.get('/microsoft-store/updates/:productid/:market?', lazyloadRouteHandler('./routes/microsoft-store/updates'));

// 上海立信会计金融学院
router.get('/slu/tzgg/:id', lazyloadRouteHandler('./routes/universities/slu/tzgg'));
router.get('/slu/jwc/:id', lazyloadRouteHandler('./routes/universities/slu/jwc'));
router.get('/slu/tyyjkxy/:id', lazyloadRouteHandler('./routes/universities/slu/tyyjkxy'));
router.get('/slu/kjxy/:id', lazyloadRouteHandler('./routes/universities/slu/kjxy'));
router.get('/slu/xsc/:id', lazyloadRouteHandler('./routes/universities/slu/xsc'));
router.get('/slu/csggxy/:id', lazyloadRouteHandler('./routes/universities/slu/csggxy'));

// Ruby China
router.get('/ruby-china/topics/:type?', lazyloadRouteHandler('./routes/ruby-china/topics'));
router.get('/ruby-china/jobs', lazyloadRouteHandler('./routes/ruby-china/jobs'));

// 中国人事考试网
router.get('/cpta/notice', lazyloadRouteHandler('./routes/cpta/notice'));

// 广告网
router.get('/adquan/:type?', lazyloadRouteHandler('./routes/adquan/index'));

// 齐鲁晚报
router.get('/qlwb/news', lazyloadRouteHandler('./routes/qlwb/news'));
router.get('/qlwb/city/:city', lazyloadRouteHandler('./routes/qlwb/city'));

// 蜻蜓FM
// router.get('/qingting/channel/:id', lazyloadRouteHandler('./routes/qingting/channel'));

// 金色财经
router.get('/jinse/lives', lazyloadRouteHandler('./routes/jinse/lives'));
router.get('/jinse/timeline', lazyloadRouteHandler('./routes/jinse/timeline'));
router.get('/jinse/catalogue/:caty', lazyloadRouteHandler('./routes/jinse/catalogue'));

// deeplearning.ai
router.get('/deeplearningai/thebatch', lazyloadRouteHandler('./routes/deeplearningai/thebatch'));

// Fate Grand Order
router.get('/fgo/news', lazyloadRouteHandler('./routes/fgo/news'));

// RF技术社区
router.get('/rf/article', lazyloadRouteHandler('./routes/rf/article'));

// University of Massachusetts Amherst
router.get('/umass/amherst/ecenews', lazyloadRouteHandler('./routes/umass/amherst/ecenews'));
router.get('/umass/amherst/eceseminar', lazyloadRouteHandler('./routes/umass/amherst/eceseminar'));
router.get('/umass/amherst/csnews', lazyloadRouteHandler('./routes/umass/amherst/csnews'));
router.get('/umass/amherst/ipoevents', lazyloadRouteHandler('./routes/umass/amherst/ipoevents'));
router.get('/umass/amherst/ipostories', lazyloadRouteHandler('./routes/umass/amherst/ipostories'));

// 飘花电影网
router.get('/piaohua/hot', lazyloadRouteHandler('./routes/piaohua/hot'));

// 快媒体
router.get('/kuai', lazyloadRouteHandler('./routes/kuai/index'));
router.get('/kuai/:id', lazyloadRouteHandler('./routes/kuai/id'));

// 生物帮
router.get('/biobio/:id', lazyloadRouteHandler('./routes/biobio/index'));
router.get('/biobio/:column/:id', lazyloadRouteHandler('./routes/biobio/others'));

// 199it
router.get('/199it', lazyloadRouteHandler('./routes/199it/index'));
router.get('/199it/category/:caty', lazyloadRouteHandler('./routes/199it/category'));
router.get('/199it/tag/:tag', lazyloadRouteHandler('./routes/199it/tag'));

// 唧唧堂
router.get('/jijitang/article/:id', lazyloadRouteHandler('./routes/jijitang/article'));
router.get('/jijitang/publication', lazyloadRouteHandler('./routes/jijitang/publication'));

// 新闻联播
// router.get('/xwlb', lazyloadRouteHandler('./routes/xwlb/index'));

// 端传媒
// router.get('/initium/:type?/:language?', lazyloadRouteHandler('./routes/initium/full'));
// router.get('/theinitium/:model/:type?/:language?', lazyloadRouteHandler('./routes/initium/full'));

// Grub Street
router.get('/grubstreet', lazyloadRouteHandler('./routes/grubstreet/index'));

// 漫画堆
router.get('/manhuadui/manhua/:name/:serial?', lazyloadRouteHandler('./routes/manhuadui/manhua'));

// 风之漫画
// router.get('/fzdm/manhua/:id', lazyloadRouteHandler('./routes/fzdm/manhua'));

// Aljazeera 半岛网
// router.get('/aljazeera/news', lazyloadRouteHandler('./routes/aljazeera/news'));

// CFD indices dividend adjustment
router.get('/cfd/gbp_div', lazyloadRouteHandler('./routes/cfd/gbp_div'));

// Monotype
router.get('/monotype/article', lazyloadRouteHandler('./routes/monotype/article'));

// Stork
router.get('/stork/keyword/:trackID/:displayKey', lazyloadRouteHandler('./routes/stork/keyword'));

// 致美化
router.get('/zhutix/latest', lazyloadRouteHandler('./routes/zhutix/latest'));

// arXiv
router.get('/arxiv/:query', lazyloadRouteHandler('./routes/arxiv/query'));

// 生物谷
router.get('/shengwugu/:uid?', lazyloadRouteHandler('./routes/shengwugu/index'));

// 环球律师事务所文章
router.get('/law/hq', lazyloadRouteHandler('./routes/law/hq'));

// 海问律师事务所文章
router.get('/law/hw', lazyloadRouteHandler('./routes/law/hw'));

// 国枫律师事务所文章
router.get('/law/gf', lazyloadRouteHandler('./routes/law/gf'));

// 通商律师事务所文章
router.get('/law/ts', lazyloadRouteHandler('./routes/law/ts'));

// 锦天城律师事务所文章
router.get('/law/jtc', lazyloadRouteHandler('./routes/law/jtc'));

// 中伦律师事务所文章
router.get('/law/zl', lazyloadRouteHandler('./routes/law/zl'));

// 君合律师事务所文章
router.get('/law/jh', lazyloadRouteHandler('./routes/law/jh'));

// 德恒律师事务所文章
router.get('/law/dh', lazyloadRouteHandler('./routes/law/dh'));

// 金诚同达律师事务所文章
router.get('/law/jctd', lazyloadRouteHandler('./routes/law/jctd'));

// 三星盖乐世社区
router.get('/samsungmembers/latest', lazyloadRouteHandler('./routes/samsungmembers/latest'));

// 东莞教研网
// router.get('/dgjyw/:type', lazyloadRouteHandler('./routes/dgjyw/index'));

// 中国信息通信研究院
router.get('/gov/caict/bps', lazyloadRouteHandler('./routes/gov/caict/bps'));
router.get('/gov/caict/qwsj', lazyloadRouteHandler('./routes/gov/caict/qwsj'));
router.get('/gov/caict/caictgd', lazyloadRouteHandler('./routes/gov/caict/caictgd'));

// 中证网
router.get('/cs/news/:caty', lazyloadRouteHandler('./routes/cs/news'));

// 财联社
// router.get('/cls/depth/:category?', lazyloadRouteHandler('./routes/cls/depth'));
// router.get('/cls/telegraph/:category?', lazyloadRouteHandler('./routes/cls/telegraph'));

// hentai-cosplays
router.get('/hentai-cosplays/:type?/:name?', lazyloadRouteHandler('./routes/hentai-cosplays/hentai-cosplays'));
router.get('/porn-images-xxx/:type?/:name?', lazyloadRouteHandler('./routes/hentai-cosplays/porn-images-xxx'));

// dcinside
router.get('/dcinside/board/:id', lazyloadRouteHandler('./routes/dcinside/board'));

// 企鹅电竞
router.get('/egameqq/room/:id', lazyloadRouteHandler('./routes/tencent/egame/room'));

// 国家税务总局
router.get('/gov/chinatax/latest', lazyloadRouteHandler('./routes/gov/chinatax/latest'));

// 荔枝FM
router.get('/lizhi/user/:id', lazyloadRouteHandler('./routes/lizhi/user'));

// 富途牛牛
router.get('/futunn/highlights', lazyloadRouteHandler('./routes/futunn/highlights'));

// 即刻 migrated to v2
// router.get('/jike/topic/:id', lazyloadRouteHandler('./routes/jike/topic'));
// router.get('/jike/topic/text/:id', lazyloadRouteHandler('./routes/jike/topicText'));
// router.get('/jike/user/:id', lazyloadRouteHandler('./routes/jike/user'));

// 网易新闻
// router.get('/netease/news/rank/:category?/:type?/:time?', lazyloadRouteHandler('./routes/netease/news/rank'));
// router.get('/netease/news/special/:type?', lazyloadRouteHandler('./routes/netease/news/special'));

// 网易 - 网易号
// router.get('/netease/dy/:id', lazyloadRouteHandler('./routes/netease/dy'));
// router.get('/netease/dy2/:id', lazyloadRouteHandler('./routes/netease/dy2'));

// 网易大神
// router.get('/netease/ds/:id', lazyloadRouteHandler('./routes/netease/ds'));

// 网易公开课
// router.get('/open163/vip', lazyloadRouteHandler('./routes/netease/open/vip'));
// router.get('/open163/latest', lazyloadRouteHandler('./routes/netease/open/latest'));

// Boston.com
router.get('/boston/:tag?', lazyloadRouteHandler('./routes/boston/index'));

// 场库
router.get('/changku', lazyloadRouteHandler('./routes/changku/index'));
router.get('/changku/cate/:postid', lazyloadRouteHandler('./routes/changku/index'));

// SCMP
// router.get('/scmp/:category_id', lazyloadRouteHandler('./routes/scmp/index'));

// 上海市生态环境局
router.get('/gov/shanghai/sthj', lazyloadRouteHandler('./routes/gov/shanghai/sthj'));

// 才符
router.get('/91ddcc/user/:user', lazyloadRouteHandler('./routes/91ddcc/user'));
router.get('/91ddcc/stage/:stage', lazyloadRouteHandler('./routes/91ddcc/stage'));

// BookwalkerTW热门新书
router.get('/bookwalkertw/news', lazyloadRouteHandler('./routes/bookwalkertw/news'));

// Chicago Tribune
router.get('/chicagotribune/:category/:subcategory?', lazyloadRouteHandler('./routes/chicagotribune/index'));

// Amazfit Watch Faces
router.get('/amazfitwatchfaces/fresh/:model/:type?/:lang?', lazyloadRouteHandler('./routes/amazfitwatchfaces/fresh'));
router.get('/amazfitwatchfaces/updated/:model/:type?/:lang?', lazyloadRouteHandler('./routes/amazfitwatchfaces/updated'));
router.get('/amazfitwatchfaces/top/:model/:type?/:time?/:sortBy?/:lang?', lazyloadRouteHandler('./routes/amazfitwatchfaces/top'));
router.get('/amazfitwatchfaces/search/:model/:keyword?/:sortBy?', lazyloadRouteHandler('./routes/amazfitwatchfaces/search'));

// 猫耳FM
router.get('/missevan/drama/latest', lazyloadRouteHandler('./routes/missevan/latest'));
router.get('/missevan/drama/:id', lazyloadRouteHandler('./routes/missevan/drama'));

// Go语言爱好者周刊
router.get('/go-weekly', lazyloadRouteHandler('./routes/go-weekly'));

// popiask提问箱
router.get('/popiask/:sharecode/:pagesize?', lazyloadRouteHandler('./routes/popiask/questions'));

// Tapechat提问箱
router.get('/tapechat/questionbox/:sharecode/:pagesize?', lazyloadRouteHandler('./routes/popiask/tapechat_questions'));

// AMD
router.get('/amd/graphicsdrivers/:id/:rid?', lazyloadRouteHandler('./routes/amd/graphicsdrivers'));

// 二柄APP
// router.get('/erbingapp/news', lazyloadRouteHandler('./routes/erbingapp/news'));

// 电商报
router.get('/dsb/area/:area', lazyloadRouteHandler('./routes/dsb/area'));

// 靠谱新闻
router.get('/kaopunews/:language?', lazyloadRouteHandler('./routes/kaopunews'));

// 格隆汇 migrated to v2
// router.get('/gelonghui/user/:id', lazyloadRouteHandler('./routes/gelonghui/user'));
// router.get('/gelonghui/subject/:id', lazyloadRouteHandler('./routes/gelonghui/subject'));
// router.get('/gelonghui/keyword/:keyword', lazyloadRouteHandler('./routes/gelonghui/keyword'));

// 光谷社区
router.get('/guanggoo/:category?', lazyloadRouteHandler('./routes/guanggoo/index'));

// 万维读者
router.get('/creaders/headline', lazyloadRouteHandler('./routes/creaders/headline'));

// 金山词霸
router.get('/iciba/:days?/:img_type?', lazyloadRouteHandler('./routes/iciba/index'));

// 重庆市两江新区信息公开网
router.get('/gov/chongqing/ljxq/dwgk', lazyloadRouteHandler('./routes/gov/chongqing/ljxq/dwgk'));
router.get('/gov/chongqing/ljxq/zwgk/:caty', lazyloadRouteHandler('./routes/gov/chongqing/ljxq/zwgk'));

// 国家突发事件预警信息发布网
router.get('/12379', lazyloadRouteHandler('./routes/12379/index'));

// 鸟哥笔记
router.get('/ngbj', lazyloadRouteHandler('./routes/niaogebiji/index'));
router.get('/ngbj/today', lazyloadRouteHandler('./routes/niaogebiji/today'));
router.get('/ngbj/cat/:cat', lazyloadRouteHandler('./routes/niaogebiji/cat'));

// 梅花网
router.get('/meihua/shots/:caty', lazyloadRouteHandler('./routes/meihua/shots'));
router.get('/meihua/article/:caty', lazyloadRouteHandler('./routes/meihua/article'));

// 看点快报
router.get('/kuaibao', lazyloadRouteHandler('./routes/kuaibao/index'));

// SocialBeta
router.get('/socialbeta/home', lazyloadRouteHandler('./routes/socialbeta/home'));
router.get('/socialbeta/hunt', lazyloadRouteHandler('./routes/socialbeta/hunt'));

// 东方我乐多丛志
router.get('/touhougarakuta/:language/:type', lazyloadRouteHandler('./routes/touhougarakuta'));

// 猎趣TV
router.get('/liequtv/room/:id', lazyloadRouteHandler('./routes/liequtv/room'));

// 北京物资学院
router.get('/bwu/news', lazyloadRouteHandler('./routes/universities/bwu/news'));

// 新榜
router.get('/newrank/wechat/:wxid', lazyloadRouteHandler('./routes/newrank/wechat'));
router.get('/newrank/douyin/:dyid', lazyloadRouteHandler('./routes/newrank/douyin'));

// 漫小肆
router.get('/manxiaosi/book/:id', lazyloadRouteHandler('./routes/manxiaosi/book'));

// 吉林大学校内通知
router.get('/jlu/oa', lazyloadRouteHandler('./routes/universities/jlu/oa'));

// 小宇宙 migrated to v2
// router.get('/xiaoyuzhou', lazyloadRouteHandler('./routes/xiaoyuzhou/pickup'));
// router.get('/xiaoyuzhou/podcast/:id', lazyloadRouteHandler('./routes/xiaoyuzhou/podcast'));

// 合肥工业大学
router.get('/hfut/tzgg', lazyloadRouteHandler('./routes/universities/hfut/tzgg'));

// Darwin Awards
// router.get('/darwinawards/all', lazyloadRouteHandler('./routes/darwinawards/articles'));

// 四川职业技术学院
// router.get('/scvtc/xygg', lazyloadRouteHandler('./routes/universities/scvtc/xygg'));

// 华南理工大学土木与交通学院
router.get('/scut/scet/notice', lazyloadRouteHandler('./routes/universities/scut/scet/notice'));

// 华南理工大学电子与信息学院
router.get('/scut/seie/news_center', lazyloadRouteHandler('./routes/universities/scut/seie/news_center'));

// OneJAV
router.get('/onejav/:type/:key?', lazyloadRouteHandler('./routes/onejav/one'));

// 141jav
router.get('/141jav/:type/:key?', lazyloadRouteHandler('./routes/141jav/141jav'));

// 141ppv
router.get('/141ppv/:type/:key?', lazyloadRouteHandler('./routes/141ppv/141ppv'));

// CuriousCat
router.get('/curiouscat/user/:id', lazyloadRouteHandler('./routes/curiouscat/user'));

// Telecompaper
router.get('/telecompaper/news/:caty/:year?/:country?/:type?', lazyloadRouteHandler('./routes/telecompaper/news'));
router.get('/telecompaper/search/:keyword?/:company?/:sort?/:period?', lazyloadRouteHandler('./routes/telecompaper/search'));

// 水木社区
router.get('/newsmth/account/:id', lazyloadRouteHandler('./routes/newsmth/account'));
router.get('/newsmth/section/:section', lazyloadRouteHandler('./routes/newsmth/section'));

// Kotaku
router.get('/kotaku/story/:type', lazyloadRouteHandler('./routes/kotaku/story'));

// 梅斯医学
router.get('/medsci/recommend', lazyloadRouteHandler('./routes/medsci/recommend'));

// Wallpaperhub migrated to v2
// router.get('/wallpaperhub', lazyloadRouteHandler('./routes/wallpaperhub/index'));

// 悟空问答
router.get('/wukong/user/:id/:type?', lazyloadRouteHandler('./routes/wukong/user'));

// 腾讯大数据
router.get('/tencent/bigdata', lazyloadRouteHandler('./routes/tencent/bigdata/index'));

// 搜韵网
router.get('/souyun/today', lazyloadRouteHandler('./routes/souyun/today'));

// 生物谷
router.get('/bioon/latest', lazyloadRouteHandler('./routes/bioon/latest'));

// soomal
router.get('/soomal/topics/:category/:language?', lazyloadRouteHandler('./routes/soomal/topics'));

// NASA
router.get('/nasa/apod', lazyloadRouteHandler('./routes/nasa/apod'));
router.get('/nasa/apod-ncku', lazyloadRouteHandler('./routes/nasa/apod-ncku'));
router.get('/nasa/apod-cn', lazyloadRouteHandler('./routes/nasa/apod-cn'));

// 爱Q生活网
router.get('/iqshw/latest', lazyloadRouteHandler('./routes/3k8/latest'));
router.get('/3k8/latest', lazyloadRouteHandler('./routes/3k8/latest'));

// JustRun
router.get('/justrun', lazyloadRouteHandler('./routes/justrun/index'));

// 上海电力大学 migrated to v2
// router.get('/shiep/:type/:id?', lazyloadRouteHandler('./routes/universities/shiep/index'));

// 福建新闻
router.get('/fjnews/:city/:limit', lazyloadRouteHandler('./routes/fjnews/fznews'));
router.get('/fjnews/jjnews', lazyloadRouteHandler('./routes/fjnews/jjnews'));

// 中山网新闻
router.get('/zsnews/index/:cateid', lazyloadRouteHandler('./routes/zsnews/index'));

// 孔夫子旧书网
router.get('/kongfz/people/:id', lazyloadRouteHandler('./routes/kongfz/people'));
router.get('/kongfz/shop/:id/:cat?', lazyloadRouteHandler('./routes/kongfz/shop'));

// XMind
router.get('/xmind/mindmap/:lang?', lazyloadRouteHandler('./routes/xmind/mindmap'));

// 小刀娱乐网
// router.get('/x6d/:id?', lazyloadRouteHandler('./routes/x6d/index'));

// 思维导图社区
router.get('/edrawsoft/mindmap/:classId?/:order?/:sort?/:lang?/:price?/:search?', lazyloadRouteHandler('./routes/edrawsoft/mindmap'));

// 它惠网
router.get('/tahui/rptlist', lazyloadRouteHandler('./routes/tahui/rptlist'));

// Guiltfree
router.get('/guiltfree/onsale', lazyloadRouteHandler('./routes/guiltfree/onsale'));

// 消费明鉴
router.get('/mingjian', lazyloadRouteHandler('./routes/mingjian/index'));

// hentaimama
router.get('/hentaimama/videos', lazyloadRouteHandler('./routes/hentaimama/videos'));

// 无讼
router.get('/itslaw/judgements/:conditions', lazyloadRouteHandler('./routes/itslaw/judgements'));

// 文学城
router.get('/wenxuecity/blog/:id', lazyloadRouteHandler('./routes/wenxuecity/blog'));
router.get('/wenxuecity/bbs/:cat/:elite?', lazyloadRouteHandler('./routes/wenxuecity/bbs'));
router.get('/wenxuecity/hot/:cid', lazyloadRouteHandler('./routes/wenxuecity/hot'));
router.get('/wenxuecity/news', lazyloadRouteHandler('./routes/wenxuecity/news'));

// 不安全
router.get('/buaq', lazyloadRouteHandler('./routes/buaq/index'));

// 快出海
router.get('/kchuhai', lazyloadRouteHandler('./routes/kchuhai/index'));

// i春秋资讯
router.get('/ichunqiu', lazyloadRouteHandler('./routes/ichunqiu/index'));

// 冰山博客
router.get('/bsblog123', lazyloadRouteHandler('./routes/bsblog123/index'));

// 纳威安全导航
router.get('/navisec', lazyloadRouteHandler('./routes/navisec/index'));

// 安全师
router.get('/secshi', lazyloadRouteHandler('./routes/secshi/index'));

// 出海笔记
router.get('/chuhaibiji', lazyloadRouteHandler('./routes/chuhaibiji/index'));

// 建宁闲谈
router.get('/blogs/jianning', lazyloadRouteHandler('./routes/blogs/jianning'));

// 妖火网
// router.get('/yaohuo/:type?', lazyloadRouteHandler('./routes/yaohuo/index'));

// 互动吧
router.get('/hudongba/:city/:id', lazyloadRouteHandler('./routes/hudongba/index'));

// 飞雪娱乐网
router.get('/feixuew/:id?', lazyloadRouteHandler('./routes/feixuew/index'));

// 1X
router.get('/1x/:category?', lazyloadRouteHandler('./routes/1x/index'));

// 剑网3
router.get('/jx3/:caty?', lazyloadRouteHandler('./routes/jx3/news'));

// GQ
// router.get('/gq/tw/:caty?/:subcaty?', lazyloadRouteHandler('./routes/gq/tw/index'));

// 泉州市跨境电子商务协会
router.get('/qzcea/:caty?', lazyloadRouteHandler('./routes/qzcea/index'));

// 福利年
router.get('/fulinian/:caty?', lazyloadRouteHandler('./routes/fulinian/index'));

// CGTN
router.get('/cgtn/top', lazyloadRouteHandler('./routes/cgtn/top'));
router.get('/cgtn/most/:type?/:time?', lazyloadRouteHandler('./routes/cgtn/most'));

router.get('/cgtn/pick', lazyloadRouteHandler('./routes/cgtn/pick'));

router.get('/cgtn/opinions', lazyloadRouteHandler('./routes/cgtn/opinions'));

// AppSales
router.get('/appsales/:caty?/:time?', lazyloadRouteHandler('./routes/appsales/index'));

// Academy of Management
router.get('/aom/journal/:id', lazyloadRouteHandler('./routes/aom/journal'));

// 巴哈姆特電玩資訊站 migrated to v2
// router.get('/gamer/hot/:bsn', lazyloadRouteHandler('./routes/gamer/hot'));

// iCity
router.get('/icity/:id', lazyloadRouteHandler('./routes/icity/index'));

// Anki
router.get('/anki/changes', lazyloadRouteHandler('./routes/anki/changes'));

// ABC News
router.get('/abc/:id?', lazyloadRouteHandler('./routes/abc'));

// 台湾中央通讯社
router.get('/cna/:id?', lazyloadRouteHandler('./routes/cna/index'));

// 华为心声社区
router.get('/huawei/xinsheng/:caty?/:order?/:keyword?', lazyloadRouteHandler('./routes/huawei/xinsheng/index'));

// 守望先锋
router.get('/ow/patch', lazyloadRouteHandler('./routes/ow/patch'));

// MM范
// router.get('/95mm/tab/:tab?', lazyloadRouteHandler('./routes/95mm/tab'));
// router.get('/95mm/tag/:tag', lazyloadRouteHandler('./routes/95mm/tag'));
// router.get('/95mm/category/:category', lazyloadRouteHandler('./routes/95mm/category'));

// 中国工程科技知识中心
router.get('/cktest/app/:ctgroup?/:domain?', lazyloadRouteHandler('./routes/cktest/app'));
router.get('/cktest/policy', lazyloadRouteHandler('./routes/cktest/policy'));

// 妈咪帮
router.get('/mamibuy/:caty?/:age?/:sort?', lazyloadRouteHandler('./routes/mamibuy/index'));

// Mercari
router.get('/mercari/:type/:id', lazyloadRouteHandler('./routes/mercari/index'));

// notefolio
router.get('/notefolio/:caty?/:order?/:time?/:query?', lazyloadRouteHandler('./routes/notefolio/index'));

// JavDB
// router.get('/javdb/home/:category?/:sort?/:filter?', lazyloadRouteHandler('./routes/javdb'));
// router.get('/javdb/search/:keyword?/:filter?', lazyloadRouteHandler('./routes/javdb/search'));
// router.get('/javdb/tags/:query?/:caty?', lazyloadRouteHandler('./routes/javdb/tags'));
// router.get('/javdb/actors/:id/:filter?', lazyloadRouteHandler('./routes/javdb/actors'));
// router.get('/javdb/makers/:id/:filter?', lazyloadRouteHandler('./routes/javdb/makers'));
// router.get('/javdb/series/:id/:filter?', lazyloadRouteHandler('./routes/javdb/series'));
// router.get('/javdb/rankings/:caty?/:time?', lazyloadRouteHandler('./routes/javdb/rankings'));
// router.get('/javdb/:category?/:sort?/:filter?', lazyloadRouteHandler('./routes/javdb'));

// World Economic Forum
router.get('/weforum/report/:lang?/:year?/:platform?', lazyloadRouteHandler('./routes/weforum/report'));

// Nobel Prize
router.get('/nobelprize/:caty?', lazyloadRouteHandler('./routes/nobelprize/index'));

// 中華民國國防部
router.get('/gov/taiwan/mnd', lazyloadRouteHandler('./routes/gov/taiwan/mnd'));

// 読売新聞 to v2
// router.get('/yomiuri/:category', lazyloadRouteHandler('./routes/yomiuri/news'));

// 巴哈姆特
// GNN新闻 migrated to v2
// router.get('/gamer/gnn/:category?', lazyloadRouteHandler('./routes/gamer/gnn_index'));

// 中国人大网
router.get('/npc/:caty', lazyloadRouteHandler('./routes/npc/index'));

// 高科技行业门户
router.get('/ofweek/news', lazyloadRouteHandler('./routes/ofweek/news'));

// 八阕
router.get('/popyard/:caty?', lazyloadRouteHandler('./routes/popyard/index'));

// 原神 migrated to v2
// router.get('/yuanshen/:location?/:category?', lazyloadRouteHandler('./routes/yuanshen/index'));

// World Trade Organization
router.get('/wto/dispute-settlement/:year?', lazyloadRouteHandler('./routes/wto/dispute-settlement'));

// 4399论坛
router.get('/forum4399/:mtag', lazyloadRouteHandler('./routes/game4399/forum'));

// 国防科技大学
router.get('/nudt/yjszs/:id?', lazyloadRouteHandler('./routes/universities/nudt/yjszs'));

// 全现在
router.get('/allnow/column/:id', lazyloadRouteHandler('./routes/allnow/column'));
router.get('/allnow/tag/:id', lazyloadRouteHandler('./routes/allnow/tag'));
router.get('/allnow/user/:id', lazyloadRouteHandler('./routes/allnow/user'));
router.get('/allnow', lazyloadRouteHandler('./routes/allnow/index'));

// 证券时报网
// router.get('/stcn/news/:id?', lazyloadRouteHandler('./routes/stcn/news'));
// router.get('/stcn/data/:id?', lazyloadRouteHandler('./routes/stcn/data'));
// router.get('/stcn/kuaixun/:id?', lazyloadRouteHandler('./routes/stcn/kuaixun'));

// dev.to
router.get('/dev.to/top/:period', lazyloadRouteHandler('./routes/dev.to/top'));

// GameRes 游资网
router.get('/gameres/hot', lazyloadRouteHandler('./routes/gameres/hot'));
router.get('/gameres/list/:id', lazyloadRouteHandler('./routes/gameres/list'));

// ManicTime
router.get('/manictime/releases', lazyloadRouteHandler('./routes/manictime/releases'));

// Deutsche Welle 德国之声
router.get('/dw/:lang?/:caty?', lazyloadRouteHandler('./routes/dw/index'));

// Amazon
router.get('/amazon/ku/:type?', lazyloadRouteHandler('./routes/amazon/ku'));

// Citavi 中文网站论坛
router.get('/citavi/:caty?', lazyloadRouteHandler('./routes/citavi/index'));

// Sesame
router.get('/sesame/release_notes', lazyloadRouteHandler('./routes/sesame/release_notes'));

// 佐川急便
router.get('/sagawa/:id', lazyloadRouteHandler('./routes/sagawa/index'));

// QNAP
router.get('/qnap/release-notes/:id', lazyloadRouteHandler('./routes/qnap/release-notes'));

// Liquipedia
router.get('/liquipedia/dota2/matches/:id', lazyloadRouteHandler('./routes/liquipedia/dota2_matches.js'));

// 哈尔滨市科技局
router.get('/gov/harbin/kjj', lazyloadRouteHandler('./routes/gov/harbin/kjj'));

// WSJ migrated to v2
// router.get('/wsj/:lang/:category?', lazyloadRouteHandler('./routes/wsj/index'));

// China File
router.get('/chinafile/:category?', lazyloadRouteHandler('./routes/chinafile/index'));

// 科技島讀
router.get('/daodu/:caty?', lazyloadRouteHandler('./routes/daodu/index'));

// Grand-Challenge
router.get('/grandchallenge/user/:id', lazyloadRouteHandler('./routes/grandchallenge/user'));
router.get('/grandchallenge/challenges', lazyloadRouteHandler('./routes/grandchallenge/challenges'));

// 西北工业大学
router.get('/nwpu/:column', lazyloadRouteHandler('./routes/nwpu/index'));

// 美国联邦最高法院
router.get('/us/supremecourt/argument_audio/:year?', lazyloadRouteHandler('./routes/us/supremecourt/argument_audio'));

// 得到
// router.get('/dedao/list/:caty?', lazyloadRouteHandler('./routes/dedao/list'));
// router.get('/dedao/knowledge/:topic?/:type?', lazyloadRouteHandler('./routes/dedao/knowledge'));
// router.get('/dedao/:caty?', lazyloadRouteHandler('./routes/dedao/index'));

// 未名新闻
router.get('/mitbbs/:caty?', lazyloadRouteHandler('./routes/mitbbs/index'));

// 8kcos migrated to v2
// router.get('/8kcos/', lazyloadRouteHandler('./routes/8kcos/latest'));
// router.get('/8kcos/cat/:cat*', lazyloadRouteHandler('./routes/8kcos/cat'));
// router.get('/8kcos/tag/:tag', lazyloadRouteHandler('./routes/8kcos/tag'));

// 贾真的电商108将
router.get('/jiazhen108', lazyloadRouteHandler('./routes/jiazhen108/index'));

// Instagram
// router.get('/instagram/:category/:key', lazyloadRouteHandler('./routes/instagram/index'));

// 优设网
router.get('/uisdc/talk/:sort?', lazyloadRouteHandler('./routes/uisdc/talk'));
router.get('/uisdc/hangye/:caty?', lazyloadRouteHandler('./routes/uisdc/hangye'));
router.get('/uisdc/news', lazyloadRouteHandler('./routes/uisdc/news'));
router.get('/uisdc/zt/:title?', lazyloadRouteHandler('./routes/uisdc/zt'));
router.get('/uisdc/topic/:title?/:sort?', lazyloadRouteHandler('./routes/uisdc/topic'));

// 中国劳工观察
router.get('/chinalaborwatch/reports/:lang?/:industry?', lazyloadRouteHandler('./routes/chinalaborwatch/reports'));

// Phoronix
// router.get('/phoronix/:page/:queryOrItem?', lazyloadRouteHandler('./routes/phoronix/index'));

// 美国中央情报局
router.get('/cia/foia-annual-report', lazyloadRouteHandler('./routes/us/cia/foia-annual-report'));

// Everything
router.get('/everything/changes', lazyloadRouteHandler('./routes/everything/changes'));

// 中国劳工通讯
router.get('/clb/commentary/:lang?', lazyloadRouteHandler('./routes/clb/commentary'));

// 国际教育研究所
router.get('/iie/blog', lazyloadRouteHandler('./routes/iie/blog'));

// McKinsey Greater China
// router.get('/mckinsey/:category?', lazyloadRouteHandler('./routes/mckinsey/index'));

// 超理论坛
router.get('/chaoli/:channel?', lazyloadRouteHandler('./routes/chaoli/index'));

// Polar
router.get('/polar/blog', lazyloadRouteHandler('./routes/polar/blog'));

// XYplorer
router.get('/xyplorer/whatsnew', lazyloadRouteHandler('./routes/xyplorer/whatsnew'));

// RescueTime
router.get('/rescuetime/release-notes/:os?', lazyloadRouteHandler('./routes/rescuetime/release-notes'));

// Total Commander
router.get('/totalcommander/whatsnew', lazyloadRouteHandler('./routes/totalcommander/whatsnew'));

// Blizzard
router.get('/blizzard/news/:language?/:category?', lazyloadRouteHandler('./routes/blizzard/news'));

// DeepMind
// router.get('/deepmind/blog/:category?', lazyloadRouteHandler('./routes/deepmind/blog'));

// 东西智库
// router.get('/dx2025/:type?/:category?', lazyloadRouteHandler('./routes/dx2025/index'));

// DeepL
router.get('/deepl/blog/:lang?', lazyloadRouteHandler('./routes/deepl/blog'));

// 小木虫
router.get('/muchong/journal/:type?', lazyloadRouteHandler('./routes/muchong/journal'));
router.get('/muchong/:id/:type?/:sort?', lazyloadRouteHandler('./routes/muchong/index'));

// 求是网
router.get('/qstheory/:category?', lazyloadRouteHandler('./routes/qstheory/index'));

// 生命时报
router.get('/lifetimes/:category?', lazyloadRouteHandler('./routes/lifetimes/index'));

// MakeUseOf
router.get('/makeuseof/:category?', lazyloadRouteHandler('./routes/makeuseof/index'));

// 瞬Matataki
// 热门作品
router.get('/matataki/posts/hot/:ipfsFlag?', lazyloadRouteHandler('./routes/matataki/site/posts/scoreranking'));
// 最新作品
router.get('/matataki/posts/latest/:ipfsFlag?', lazyloadRouteHandler('./routes/matataki/site/posts/timeranking'));
// 作者创作
router.get('/matataki/users/:authorId/posts/:ipfsFlag?', lazyloadRouteHandler('./routes/matataki/site/posts/author'));
// Fan票关联作品
router.get('/matataki/tokens/:id/posts/:filterCode/:ipfsFlag?', lazyloadRouteHandler('./routes/matataki/site/posts/token'));
// 标签关联作品
router.get('/matataki/tags/:tagId/:tagName/posts/:ipfsFlag?', lazyloadRouteHandler('./routes/matataki/site/posts/tag'));
// 收藏夹
router.get('/matataki/users/:userId/favorites/:favoriteListId/posts/:ipfsFlag?', lazyloadRouteHandler('./routes/matataki/site/posts/favorite'));

// SoBooks
// router.get('/sobooks/tag/:id?', lazyloadRouteHandler('./routes/sobooks/tag'));
// router.get('/sobooks/date/:date?', lazyloadRouteHandler('./routes/sobooks/date'));
// router.get('/sobooks/:category?', lazyloadRouteHandler('./routes/sobooks/index'));

// Zhimap 知识导图社区
router.get('/zhimap/:categoryUuid?/:recommend?', lazyloadRouteHandler('./routes/zhimap/index'));

// Fantia
// router.get('/fantia/search/:type?/:caty?/:peroid?/:order?/:rating?/:keyword?', lazyloadRouteHandler('./routes/fantia/search'));
// router.get('/fantia/user/:id', lazyloadRouteHandler('./routes/fantia/user'));

// i-Cable
router.get('/icable/:category/:option?', lazyloadRouteHandler('./routes/icable/category'));

// ProcessOn
router.get('/processon/popular/:cate?/:sort?', lazyloadRouteHandler('./routes/processon/popular'));

// Mathpix
router.get('/mathpix/blog', lazyloadRouteHandler('./routes/mathpix/blog'));

// OneNote Gem Add-Ins
router.get('/onenotegem/release', lazyloadRouteHandler('./routes/onenotegem/release'));

// Mind42
router.get('/mind42/tag/:id', lazyloadRouteHandler('./routes/mind42/tag'));
router.get('/mind42/search/:keyword', lazyloadRouteHandler('./routes/mind42/search'));
router.get('/mind42/:caty?', lazyloadRouteHandler('./routes/mind42/index'));

// 幕布网
router.get('/mubu/explore/:category?/:title?', lazyloadRouteHandler('./routes/mubu/explore'));

// Esquirehk
router.get('/esquirehk/tag/:id', lazyloadRouteHandler('./routes/esquirehk/tag'));

// 国家普通话测试 杭州市
router.get('/putonghua', lazyloadRouteHandler('./routes/putonghua/hangzhou'));

// 国家自学考试 上海市 migrated to v2 /shmeea/self-study
// router.get('/self-study/shanghai', require('./routes/self-study/shanghai'));

// 有道云笔记
router.get('/youdao/xueba', lazyloadRouteHandler('./routes/youdao/xueba'));
router.get('/youdao/latest', lazyloadRouteHandler('./routes/youdao/latest'));

// 印象识堂
router.get('/yinxiang/note', lazyloadRouteHandler('./routes/yinxiang/note'));
router.get('/yinxiang/tag/:id', lazyloadRouteHandler('./routes/yinxiang/tag'));
router.get('/yinxiang/card/:id', lazyloadRouteHandler('./routes/yinxiang/card'));
router.get('/yinxiang/personal/:id', lazyloadRouteHandler('./routes/yinxiang/personal'));
router.get('/yinxiang/category/:id', lazyloadRouteHandler('./routes/yinxiang/category'));

// 晚点LatePost
// router.get('/latepost/:proma?', lazyloadRouteHandler('./routes/latepost/index'));

// 遠見 gvm.com.tw
router.get('/gvm/index/:category?', lazyloadRouteHandler('./routes/gvm/index'));

// 触乐
router.get('/chuapp/index/:category?', lazyloadRouteHandler('./routes/chuapp/index'));

// Deloitte
router.get('/deloitte/industries/:category?', lazyloadRouteHandler('./routes/deloitte/industries'));

// 特斯拉系统更新
router.get('/tesla', lazyloadRouteHandler('./routes/tesla/update'));

// 复旦大学继续教育学院
router.get('/fudan/cce', lazyloadRouteHandler('./routes/universities/fudan/cce'));

// LowEndTalk
router.get('/lowendtalk/discussion/:id?', lazyloadRouteHandler('./routes/lowendtalk/discussion'));

// 无产者评论
router.get('/proletar/:type?/:id?', lazyloadRouteHandler('./routes/proletar/index'));

// QTTabBar
router.get('/qttabbar/change-log', lazyloadRouteHandler('./routes/qttabbar/change-log'));

// 酷18
// router.get('/cool18/:id?/:type?/:keyword?', lazyloadRouteHandler('./routes/cool18/index'));

// 美国贸易代表办公室
router.get('/ustr/press-releases/:year?/:month?', lazyloadRouteHandler('./routes/us/ustr/press-releases'));

// 游戏动力
router.get('/vgn/:platform?', lazyloadRouteHandler('./routes/vgn/index'));

// 国际能源署
router.get('/iea/:category?', lazyloadRouteHandler('./routes/iea/index'));

// 中国计算机学会
// router.get('/ccf/news/:category?', lazyloadRouteHandler('./routes/ccf/news'));

// The Brain
router.get('/thebrain/:category?', lazyloadRouteHandler('./routes/thebrain/blog'));

// 美国财政部
router.get('/treasury/press-releases/:category?/:title?', lazyloadRouteHandler('./routes/us/treasury/press-releases'));

// Bandisoft
router.get('/bandisoft/:id?/:lang?', lazyloadRouteHandler('./routes/bandisoft/index'));

// MarginNote
router.get('/marginnote/tag/:id?', lazyloadRouteHandler('./routes/marginnote/tag'));

// ASML
router.get('/asml/press-releases', lazyloadRouteHandler('./routes/asml/press-releases'));

// 中国机械工程学会
router.get('/cmes/news/:category?', lazyloadRouteHandler('./routes/cmes/news'));

// Craigslist
router.get('/craigslist/:location/:type', lazyloadRouteHandler('./routes/craigslist/search'));

// 有趣天文奇观
router.get('/interesting-sky/astronomical_events/:year?', lazyloadRouteHandler('./routes/interesting-sky/astronomical_events'));
router.get('/interesting-sky/recent-interesting', lazyloadRouteHandler('./routes/interesting-sky/recent-interesting'));
router.get('/interesting-sky', lazyloadRouteHandler('./routes/interesting-sky/index'));

// 国际数学联合会
router.get('/mathunion/fields-medal', lazyloadRouteHandler('./routes/mathunion/fields-medal'));

// ACM
router.get('/acm/amturingaward', lazyloadRouteHandler('./routes/acm/amturingaward'));

// 網路天文館
router.get('/tam/forecast', lazyloadRouteHandler('./routes/tam/forecast'));

// Day One
router.get('/dayone/blog', lazyloadRouteHandler('./routes/dayone/blog'));

// 滴答清单
router.get('/dida365/habit/checkins', lazyloadRouteHandler('./routes/dida365/habit-checkins'));

// Ditto clipboard manager
router.get('/ditto/changes/:type?', lazyloadRouteHandler('./routes/ditto/changes'));

// iDaily 每日环球视野
router.get('/idaily/today', lazyloadRouteHandler('./routes/idaily/index'));

// 北屋
router.get('/northhouse/:category?', lazyloadRouteHandler('./routes/northhouse/index'));

// Oak Ridge National Laboratory
router.get('/ornl/news', lazyloadRouteHandler('./routes/ornl/news'));

// 信阳师范学院 自考办
router.get('/xynu/zkb/:category', lazyloadRouteHandler('./routes/universities/xynu/zkb'));

// Bell Labs
router.get('/bell-labs/events-news/:category?', lazyloadRouteHandler('./routes/bell-labs/events-news.js'));

// 中国科学院青年创新促进会
router.get('/yicas/blog', lazyloadRouteHandler('./routes/yicas/blog'));

// 九三学社
router.get('/93/:category?', lazyloadRouteHandler('./routes/93/index'));

// 科学网
// router.get('/sciencenet/blog/:type?/:time?/:sort?', lazyloadRouteHandler('./routes/sciencenet/blog'));

// DailyArt
router.get('/dailyart/:language?', lazyloadRouteHandler('./routes/dailyart/index'));

// SCBOY
router.get('/scboy/thread/:tid', lazyloadRouteHandler('./routes/scboy/thread'));

// 猿料
router.get('/yuanliao/:tag?/:sort?', lazyloadRouteHandler('./routes/yuanliao/index'));

// 中国政协网
router.get('/cppcc/:slug?', lazyloadRouteHandler('./routes/gov/cppcc/index'));

// National Association of Colleges and Employers
router.get('/nace/blog/:sort?', lazyloadRouteHandler('./routes/nace/blog'));

// Caixin Latest
// router.get('/caixin/latest', lazyloadRouteHandler('./routes/caixin/latest'));

// Semiconductor Industry Association
router.get('/semiconductors/latest-news', lazyloadRouteHandler('./routes/semiconductors/latest-news'));

// VOA News
router.get('/voa/day-photos', lazyloadRouteHandler('./routes/voa/day-photos'));

// Voice of America
router.get('/voa/:language/:channel?', lazyloadRouteHandler('./routes/voa/index'));

// 留园网
router.get('/6park/:id?/:type?/:keyword?', lazyloadRouteHandler('./routes/6park/index'));

// 哔嘀影视
// router.get('/mp4er/:type?/:caty?/:area?/:year?/:order?', lazyloadRouteHandler('./routes/mp4er/index'));
// router.get('/bde4/:type?/:caty?/:area?/:year?/:order?', lazyloadRouteHandler('./routes/mp4er/index'));

// 上海证券交易所
// router.get('/sse/sserules/:slug?', lazyloadRouteHandler('./routes/sse/sserules'));

// 游戏葡萄
router.get('/gamegrape/:id?', lazyloadRouteHandler('./routes/gamegrape/index'));

// 阳光高考
router.get('/chsi/zszcgd/:category?', lazyloadRouteHandler('./routes/chsi/zszcgd'));

// 眾新聞
router.get('/hkcnews/news/:category?', lazyloadRouteHandler('./routes/hkcnews/news'));

// AnyTXT
router.get('/anytxt/release-notes', lazyloadRouteHandler('./routes/anytxt/release-notes'));

// 鱼塘热榜
router.get('/mofish/:id', lazyloadRouteHandler('./routes/mofish/index'));

// Mcdonalds
router.get('/mcdonalds/:category', lazyloadRouteHandler('./routes/mcdonalds/news'));

// Pincong 品葱 migrated to v2
// router.get('/pincong/category/:category?/:sort?', lazyloadRouteHandler('./routes/pincong/index'));
// router.get('/pincong/hot/:category?', lazyloadRouteHandler('./routes/pincong/hot'));
// router.get('/pincong/topic/:topic', lazyloadRouteHandler('./routes/pincong/topic'));

// GoComics
router.get('/gocomics/:name', lazyloadRouteHandler('./routes/gocomics/index'));

// Comics Kingdom
// router.get('/comicskingdom/:name', lazyloadRouteHandler('./routes/comicskingdom/index'));

// Media Digest
router.get('/mediadigest/:range/:category?', lazyloadRouteHandler('./routes/mediadigest/category'));

// 中国农工民主党
router.get('/ngd/:slug?', lazyloadRouteHandler('./routes/gov/ngd/index'));

// SimpRead-消息通知
router.get('/simpread/notice', lazyloadRouteHandler('./routes/simpread/notice'));
// SimpRead-更新日志
router.get('/simpread/changelog', lazyloadRouteHandler('./routes/simpread/changelog'));

// booth.pm
router.get('/booth.pm/shop/:subdomain', lazyloadRouteHandler('./routes/booth-pm/shop'));

// Minecraft feed the beast
router.get('/feed-the-beast/modpack/:modpackEntry', lazyloadRouteHandler('./routes/feed-the-beast/modpack'));

// Gab
router.get('/gab/user/:username', lazyloadRouteHandler('./routes/gab/user'));
router.get('/gab/popular/:sort?', lazyloadRouteHandler('./routes/gab/explore'));

// NEW 字幕组
router.get('/newzmz/view/:id', lazyloadRouteHandler('./routes/newzmz/view'));
router.get('/newzmz/:category?', lazyloadRouteHandler('./routes/newzmz/index'));

// Phrack Magazine
router.get('/phrack', lazyloadRouteHandler('./routes/phrack/index'));

// 通識·現代中國
router.get('/chiculture/topic/:category?', lazyloadRouteHandler('./routes/chiculture/topic'));

// CQUT News
router.get('/cqut/news', lazyloadRouteHandler('./routes/universities/cqut/cqut-news'));
router.get('/cqut/libnews', lazyloadRouteHandler('./routes/universities/cqut/cqut-libnews'));

// 城农 Growin' City
router.get('/growincity/news/:id?', lazyloadRouteHandler('./routes/growincity/news'));

// Thrillist
router.get('/thrillist/:tag?', lazyloadRouteHandler('./routes/thrillist/index'));

// 丁香园
router.get('/dxy/vaccine/:province?/:city?/:location?', lazyloadRouteHandler('./routes/dxy/vaccine'));

// Wtu
router.get('/wtu/:type', lazyloadRouteHandler('./routes/universities/wtu'));

// 中国庭审公开网
router.get('/tingshen', lazyloadRouteHandler('./routes/tingshen/tingshen'));

// 中华人民共和国人力资源和社会保障部
router.get('/gov/mohrss/sbjm/:category?', lazyloadRouteHandler('./routes/gov/mohrss/sbjm'));

// 深影译站
router.get('/shinybbs/latest', lazyloadRouteHandler('./routes/shinybbs/latest'));
router.get('/shinybbs/p/:id', lazyloadRouteHandler('./routes/shinybbs/p'));
router.get('/shinybbs/page/:id?', lazyloadRouteHandler('./routes/shinybbs/index'));
router.get('/shinybbs', lazyloadRouteHandler('./routes/shinybbs/index'));

// 天眼查
router.get('/tianyancha/hot', lazyloadRouteHandler('./routes/tianyancha/hot'));

// King Arthur
router.get('/kingarthur/:type', lazyloadRouteHandler('./routes/kingarthur/index'));

// 新华网
// router.get('/news/whxw', lazyloadRouteHandler('./routes/news/whxw'));

// 游讯网
// router.get('/yxdown/recommend', lazyloadRouteHandler('./routes/yxdown/recommend'));
// router.get('/yxdown/news/:category?', lazyloadRouteHandler('./routes/yxdown/news'));

// BabeHub
router.get('/babehub/search/:keyword?', lazyloadRouteHandler('./routes/babehub/search'));
router.get('/babehub/:category?', lazyloadRouteHandler('./routes/babehub/index'));

// 深圳新闻网
router.get('/sznews/press', lazyloadRouteHandler('./routes/sznews/press'));
router.get('/sznews/ranking', lazyloadRouteHandler('./routes/sznews/ranking'));

// Shuax
router.get('/shuax/project/:name?', lazyloadRouteHandler('./routes/shuax/project'));

// BioOne
// router.get('/bioone/featured', lazyloadRouteHandler('./routes/bioone/featured'));

// Obsidian
router.get('/obsidian/announcements', lazyloadRouteHandler('./routes/obsidian/announcements'));

// 吉林工商学院
router.get('/jlbtc/kyc/:category?', lazyloadRouteHandler('./routes/universities/jlbtc/kyc'));
router.get('/jlbtc/jwc/:id?', lazyloadRouteHandler('./routes/universities/jlbtc/jwc'));
router.get('/jlbtc/:category?', lazyloadRouteHandler('./routes/universities/jlbtc/index'));

// DT 财经 migrated to v2
// router.get('/dtcj/datahero/:category?', lazyloadRouteHandler('./routes/dtcj/datahero'));
// router.get('/dtcj/datainsight/:id?', lazyloadRouteHandler('./routes/dtcj/datainsight'));

// 劍心．回憶
router.get('/kenshin/:category?/:type?', lazyloadRouteHandler('./routes/kenshin/index'));

// av01
router.get('/av01/actor/:name/:type?', lazyloadRouteHandler('./routes/av01/actor'));
router.get('/av01/tag/:name/:type?', lazyloadRouteHandler('./routes/av01/tag'));

// macked
router.get('/macked/app/:name', lazyloadRouteHandler('./routes/macked/app'));

// 美国劳工联合会-产业工会联合会
router.get('/aflcio/blog', lazyloadRouteHandler('./routes/aflcio/blog'));

// Fur Affinity
router.get('/furaffinity/home/:type?/:nsfw?', lazyloadRouteHandler('./routes/furaffinity/home'));
router.get('/furaffinity/browse/:nsfw?', lazyloadRouteHandler('./routes/furaffinity/browse'));
router.get('/furaffinity/status', lazyloadRouteHandler('./routes/furaffinity/status'));
router.get('/furaffinity/search/:keyword/:nsfw?', lazyloadRouteHandler('./routes/furaffinity/search'));
router.get('/furaffinity/user/:username', lazyloadRouteHandler('./routes/furaffinity/user'));
router.get('/furaffinity/watching/:username', lazyloadRouteHandler('./routes/furaffinity/watching'));
router.get('/furaffinity/watchers/:username', lazyloadRouteHandler('./routes/furaffinity/watchers'));
router.get('/furaffinity/commissions/:username', lazyloadRouteHandler('./routes/furaffinity/commissions'));
router.get('/furaffinity/shouts/:username', lazyloadRouteHandler('./routes/furaffinity/shouts'));
router.get('/furaffinity/journals/:username', lazyloadRouteHandler('./routes/furaffinity/journals'));
router.get('/furaffinity/gallery/:username/:nsfw?', lazyloadRouteHandler('./routes/furaffinity/gallery'));
router.get('/furaffinity/scraps/:username/:nsfw?', lazyloadRouteHandler('./routes/furaffinity/scraps'));
router.get('/furaffinity/favorites/:username/:nsfw?', lazyloadRouteHandler('./routes/furaffinity/favorites'));
router.get('/furaffinity/submission_comments/:id', lazyloadRouteHandler('./routes/furaffinity/submission_comments'));
router.get('/furaffinity/journal_comments/:id', lazyloadRouteHandler('./routes/furaffinity/journal_comments'));

// 亿欧网
router.get('/iyiou', lazyloadRouteHandler('./routes/iyiou'));

// 香港商报
router.get('/hkcd/pdf', lazyloadRouteHandler('./routes/hkcd/pdf'));

// 博客来
router.get('/bookscomtw/newbooks/:category', lazyloadRouteHandler('./routes/bookscomtw/newbooks'));

// Elite Babes
router.get('/elitebabes/videos/:sort?', lazyloadRouteHandler('./routes/elitebabes/videos'));
router.get('/elitebabes/search/:keyword?', lazyloadRouteHandler('./routes/elitebabes/search'));
router.get('/elitebabes/:category?', lazyloadRouteHandler('./routes/elitebabes/index'));

// Trakt.tv
router.get('/trakt/collection/:username/:type?', lazyloadRouteHandler('./routes/trakt/collection'));

// 全球化智库
router.get('/ccg/:category?', lazyloadRouteHandler('./routes/ccg/index'));

// 少女前线
// router.get('/gf-cn/news/:category?', lazyloadRouteHandler('./routes/gf-cn/news'));

// Eagle
// router.get('/eagle/changelog/:language?', lazyloadRouteHandler('./routes/eagle/changelog'));

// ezone.hk
// router.get('/ezone/:category?', lazyloadRouteHandler('./routes/ezone/index'));

// 中国橡胶网
router.get('/cria/news/:id?', lazyloadRouteHandler('./routes/cria/news'));

// 灵异网
router.get('/lingyi/:category', lazyloadRouteHandler('./routes/lingyi/index'));

// 歪脑读
router.get('/wainao-reads/all-articles', lazyloadRouteHandler('./routes/wainao/index'));

// react
router.get('/react/react-native-weekly', lazyloadRouteHandler('./routes/react/react-native-weekly'));

// dbaplus 社群
router.get('/dbaplus/activity/:type?', lazyloadRouteHandler('./routes/dbaplus/activity.js'));
router.get('/dbaplus/:tab?', lazyloadRouteHandler('./routes/dbaplus/tab'));

// 梨园
router.get('/liyuan-forums/threads', lazyloadRouteHandler('./routes/liyuan-forums/threads'));
router.get('/liyuan-forums/threads/forum/:forum_id', lazyloadRouteHandler('./routes/liyuan-forums/threads'));
router.get('/liyuan-forums/threads/topic/:topic_id', lazyloadRouteHandler('./routes/liyuan-forums/threads'));
router.get('/liyuan-forums/threads/user/:user_id', lazyloadRouteHandler('./routes/liyuan-forums/threads'));

// 集思录
// router.get('/jisilu/reply/:user', lazyloadRouteHandler('./routes/jisilu/reply'));
// router.get('/jisilu/topic/:user', lazyloadRouteHandler('./routes/jisilu/topic'));

// Constitutional Court of Baden-Württemberg (Germany) migrated to v2
// router.get('/verfghbw/press/:keyword?', lazyloadRouteHandler('./routes/verfghbw/press'));

// Topbook
router.get('/topbook/overview/:id?', lazyloadRouteHandler('./routes/topbook/overview'));
router.get('/topbook/today', lazyloadRouteHandler('./routes/topbook/today'));

// Melon
router.get('/melon/chart/:category?', lazyloadRouteHandler('./routes/melon/chart'));

// 弯弯字幕组
router.get('/wanwansub/info/:id', lazyloadRouteHandler('./routes/wanwansub/info'));
router.get('/wanwansub/:id?', lazyloadRouteHandler('./routes/wanwansub/index'));

// FIX 字幕侠
router.get('/zimuxia/portfolio/:id', lazyloadRouteHandler('./routes/zimuxia/portfolio'));
router.get('/zimuxia/:category?', lazyloadRouteHandler('./routes/zimuxia/index'));

// Bandcamp migrated to v2
// router.get('/bandcamp/tag/:tag?', lazyloadRouteHandler('./routes/bandcamp/tag'));
// router.get('/bandcamp/weekly', lazyloadRouteHandler('./routes/bandcamp/weekly'));

// Hugo 更新日志
router.get('/hugo/releases', lazyloadRouteHandler('./routes/hugo/releases'));

// 东立出版
router.get('/tongli/news/:type', lazyloadRouteHandler('./routes/tongli/news'));

// OR
router.get('/or/:id?', lazyloadRouteHandler('./routes/or'));

// e-hentai migrated to v2
// router.get('/ehentai/favorites/:favcat?/:order?/:page?/:routeParams?', lazyloadRouteHandler('./routes/ehentai/favorites'));
// router.get('/ehentai/search/:params?/:page?/:routeParams?', lazyloadRouteHandler('./routes/ehentai/search'));
// router.get('/ehentai/tag/:tag/:page?/:routeParams?', lazyloadRouteHandler('./routes/ehentai/tag'));

// 字型故事
router.get('/fontstory', lazyloadRouteHandler('./routes/fontstory/tw'));

// HKEPC migrated to v2
// router.get('/hkepc/:category?', lazyloadRouteHandler('./routes/hkepc/index'));

// 海南大学
router.get('/hainanu/ssszs', lazyloadRouteHandler('./routes/hainanu/ssszs'));

// 游戏年轮
router.get('/bibgame/:category?/:type?', lazyloadRouteHandler('./routes/bibgame/category'));

// 澳門特別行政區政府各公共部門獎助貸學金服務平台
router.get('/macau-bolsas/:lang?', lazyloadRouteHandler('./routes/macau-bolsas/index'));

// PotPlayer
router.get('/potplayer/update/:language?', lazyloadRouteHandler('./routes/potplayer/update'));

// 综艺秀
// router.get('/zyshow/:name', lazyloadRouteHandler('./routes/zyshow'));

// 加美财经
router.get('/caus/:category?', lazyloadRouteHandler('./routes/caus'));

// 摩点
router.get('/modian/zhongchou/:category?/:sort?/:status?', lazyloadRouteHandler('./routes/modian/zhongchou'));

// MacWk
router.get('/macwk/soft/:name', lazyloadRouteHandler('./routes/macwk/soft'));

// 世界计划 多彩舞台 feat.初音未来 (ProjectSekai)
router.get('/pjsk/news', lazyloadRouteHandler('./routes/pjsk/news'));

// 人民论坛网
router.get('/rmlt/idea/:category?', lazyloadRouteHandler('./routes/rmlt/idea'));

// CBNData
router.get('/cbndata/information/:category?', lazyloadRouteHandler('./routes/cbndata/information'));

// TANC 艺术新闻
router.get('/tanchinese/:category?', lazyloadRouteHandler('./routes/tanchinese'));

// Harvard
router.get('/harvard/health/blog', lazyloadRouteHandler('./routes/universities/harvard/health/blog'));

// yuzu emulator
router.get('/yuzu-emu/entry', lazyloadRouteHandler('./routes/yuzu-emu/entry'));

// Resources - The Partnership on AI
router.get('/partnershiponai/resources', lazyloadRouteHandler('./routes/partnershiponai/resources'));

// Common App
router.get('/commonapp/blog', lazyloadRouteHandler('./routes/commonapp/blog'));

// Sky Sports
// router.get('/skysports/news/:team', lazyloadRouteHandler('./routes/skysports/news'));

// Europa Press
router.get('/europapress/:category?', lazyloadRouteHandler('./routes/europapress'));

// World Happiness Report
router.get('/worldhappiness/blog', lazyloadRouteHandler('./routes/worldhappiness/blog'));
router.get('/worldhappiness/archive', lazyloadRouteHandler('./routes/worldhappiness/archive'));

// 中国纺织经济信息网
router.get('/ctei/news/:id?', lazyloadRouteHandler('./routes/ctei/news'));

// 时事一点通
router.get('/ssydt/article/:id?', lazyloadRouteHandler('./routes/ssydt/article'));

// 湖北省软件行业协会
router.get('/gov/hubei/hbsia/:caty', lazyloadRouteHandler('./routes/gov/hubei/hbsia'));

// 武汉东湖新技术开发区
router.get('/gov/wuhan/wehdz/:caty', lazyloadRouteHandler('./routes/gov/wuhan/wehdz'));

// 武汉市科学技术局
router.get('/gov/wuhan/kjj/:caty', lazyloadRouteHandler('./routes/gov/wuhan/kjj'));

// 费米实验室
router.get('/fnal/news/:category?', lazyloadRouteHandler('./routes/fnal/news'));

// X410
router.get('/x410/news', lazyloadRouteHandler('./routes/x410/news'));

// 恩山无线论坛
router.get('/right/forum/:id?', lazyloadRouteHandler('./routes/right/forum'));

// 香港經濟日報 migrated to v2
// router.get('/hket/:category?', lazyloadRouteHandler('./routes/hket/index'));

// micmicidol
router.get('/micmicidol', lazyloadRouteHandler('./routes/micmicidol/latest'));
router.get('/micmicidol/search/:label', lazyloadRouteHandler('./routes/micmicidol/search'));

// 香港高登
router.get('/hkgolden/:id?/:limit?/:sort?', lazyloadRouteHandler('./routes/hkgolden'));

// 香港討論區
router.get('/discuss/:fid', lazyloadRouteHandler('./routes/discuss'));

// Uwants
router.get('/uwants/:fid', lazyloadRouteHandler('./routes/uwants'));

// Now新聞
router.get('/now/news/rank', lazyloadRouteHandler('./routes/now/rank'));

// s-hentai
router.get('/s-hentai/:id?', lazyloadRouteHandler('./routes/s-hentai'));

// etherscan
router.get('/etherscan/transactions/:address', lazyloadRouteHandler('./routes/etherscan/transactions'));

// foreverblog
router.get('/blogs/foreverblog', lazyloadRouteHandler('./routes/blogs/foreverblog'));

// Netflix
router.get('/netflix/newsroom/:category?/:region?', lazyloadRouteHandler('./routes/netflix/newsroom'));

// SBS
router.get('/sbs/chinese/:category?/:id?/:dialect?/:language?', lazyloadRouteHandler('./routes/sbs/chinese'));

// Asian to lick
// router.get('/asiantolick/:category?/:keyword?', lazyloadRouteHandler('./routes/asiantolick'));

// Research Gate
// router.get('/researchgate/publications/:id', lazyloadRouteHandler('./routes/researchgate/publications'));

// QuestMobile
router.get('/questmobile/report/:category?/:label?', lazyloadRouteHandler('./routes/questmobile/report'));

// RSS3
router.get('/rss3/blog', lazyloadRouteHandler('./routes/rss3/blog'));

// 星球日报
// router.get('/odaily/activity', lazyloadRouteHandler('./routes/odaily/activity'));
// router.get('/odaily/newsflash', lazyloadRouteHandler('./routes/odaily/newsflash'));
// router.get('/odaily/user/:id', lazyloadRouteHandler('./routes/odaily/user'));
// router.get('/odaily/:id?', lazyloadRouteHandler('./routes/odaily/post'));

// Fashion Network
router.get('/fashionnetwork/news/:sectors?/:categories?/:language?', lazyloadRouteHandler('./routes/fashionnetwork/news.js'));

// dykszx
router.get('/dykszx/news/:type?', lazyloadRouteHandler('./routes/dykszx/news'));

// 安全内参
// router.get('/secrss/category/:category?', lazyloadRouteHandler('./routes/secrss/category'));
// router.get('/secrss/author/:author?', lazyloadRouteHandler('./routes/secrss/author'));

// Fashion Network
router.get('/fashionnetwork/headline/:country?', lazyloadRouteHandler('./routes/fashionnetwork/headline.js'));

// mirror.xyz
// router.get('/mirror/:id', lazyloadRouteHandler('./routes/mirror/entries'));

// KBS migrated to v2
// router.get('/kbs/today/:language?', lazyloadRouteHandler('./routes/kbs/today'));
// router.get('/kbs/news/:category?/:language?', lazyloadRouteHandler('./routes/kbs/news'));

// Deprecated: DO NOT ADD ANY NEW ROUTES HERE

module.exports = router;
