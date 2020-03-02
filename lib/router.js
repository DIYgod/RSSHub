const Router = require('@koa/router');
const router = new Router();

// 遍历整个 routes 文件夹，导入模块路由 router.js 和 router-custom.js 文件
// 格式参考用例：routes/epicgames/router.js
const RouterPath = require('require-all')({
    dirname: __dirname + '/routes',
    filter: /^.*router([-_]custom[s]?)?\.js$/,
});

// 将收集到的自定义模块路由进行合并
for (const project in RouterPath) {
    for (const routerName in RouterPath[project]) {
        const proRouter = RouterPath[project][routerName]();
        proRouter.stack.forEach((nestedLayer) => {
            router.stack.push(nestedLayer);
        });
    }
}

// index
router.get('/', require('./routes/index'));

// test
router.get('/test/:id', require('./routes/test'));

// RSSHub
router.get('/rsshub/rss', require('./routes/rsshub/routes')); // 弃用
router.get('/rsshub/routes', require('./routes/rsshub/routes'));
router.get('/rsshub/sponsors', require('./routes/rsshub/sponsors'));

// 1draw
router.get('/1draw/', require('./routes/1draw/index'));

// 1X Magazine
router.get('/1x/magazine', require('./routes/1x/magazine'));

// bilibili
router.get('/bilibili/user/video/:uid/:disableEmbed?', require('./routes/bilibili/video'));
router.get('/bilibili/user/article/:uid', require('./routes/bilibili/article'));
router.get('/bilibili/user/fav/:uid/:disableEmbed?', require('./routes/bilibili/userFav'));
router.get('/bilibili/user/coin/:uid/:disableEmbed?', require('./routes/bilibili/coin'));
router.get('/bilibili/user/dynamic/:uid/:disableEmbed?', require('./routes/bilibili/dynamic'));
router.get('/bilibili/user/followers/:uid', require('./routes/bilibili/followers'));
router.get('/bilibili/user/followings/:uid', require('./routes/bilibili/followings'));
router.get('/bilibili/user/bangumi/:uid', require('./routes/bilibili/user_bangumi'));
router.get('/bilibili/partion/:tid/:disableEmbed?', require('./routes/bilibili/partion'));
router.get('/bilibili/partion/ranking/:tid/:days?/:disableEmbed?', require('./routes/bilibili/partion-ranking'));
router.get('/bilibili/bangumi/:seasonid', require('./routes/bilibili/bangumi')); // 弃用
router.get('/bilibili/bangumi/media/:mediaid', require('./routes/bilibili/bangumi'));
router.get('/bilibili/video/page/:aid/:disableEmbed?', require('./routes/bilibili/page'));
router.get('/bilibili/video/reply/:aid', require('./routes/bilibili/reply'));
router.get('/bilibili/video/danmaku/:aid/:pid?', require('./routes/bilibili/danmaku'));
router.get('/bilibili/link/news/:product', require('./routes/bilibili/linkNews'));
router.get('/bilibili/live/room/:roomID', require('./routes/bilibili/liveRoom'));
router.get('/bilibili/live/search/:key/:order', require('./routes/bilibili/liveSearch'));
router.get('/bilibili/live/area/:areaID/:order', require('./routes/bilibili/liveArea'));
router.get('/bilibili/fav/:uid/:fid/:disableEmbed?', require('./routes/bilibili/fav'));
router.get('/bilibili/blackboard', require('./routes/bilibili/blackboard'));
router.get('/bilibili/mall/new', require('./routes/bilibili/mallNew'));
router.get('/bilibili/mall/ip/:id', require('./routes/bilibili/mallIP'));
router.get('/bilibili/ranking/:rid?/:day?/:arc_type?/:disableEmbed?', require('./routes/bilibili/ranking'));
router.get('/bilibili/user/channel/:uid/:cid/:disableEmbed?', require('./routes/bilibili/userChannel'));
router.get('/bilibili/topic/:topic', require('./routes/bilibili/topic'));
router.get('/bilibili/audio/:id', require('./routes/bilibili/audio'));
router.get('/bilibili/vsearch/:kw/:order?/:disableEmbed?', require('./routes/bilibili/vsearch'));
router.get('/bilibili/followings/video/:uid/:disableEmbed?', require('./routes/bilibili/followings_video'));
router.get('/bilibili/followings/article/:uid', require('./routes/bilibili/followings_article'));
router.get('/bilibili/readlist/:listid', require('./routes/bilibili/readlist'));
router.get('/bilibili/weekly', require('./routes/bilibili/weekly_recommend'));

// bangumi
router.get('/bangumi/calendar/today', require('./routes/bangumi/calendar/today'));
router.get('/bangumi/subject/:id/:type', require('./routes/bangumi/subject'));
router.get('/bangumi/person/:id', require('./routes/bangumi/person'));
router.get('/bangumi/topic/:id', require('./routes/bangumi/group/reply'));
router.get('/bangumi/group/:id', require('./routes/bangumi/group/topic'));
router.get('/bangumi/subject/:id', require('./routes/bangumi/subject'));

// 微博
router.get('/weibo/user/:uid/:displayVideo?', require('./routes/weibo/user'));
router.get('/weibo/keyword/:keyword', require('./routes/weibo/keyword'));
router.get('/weibo/search/hot', require('./routes/weibo/search/hot'));
router.get('/weibo/super_index/:id', require('./routes/weibo/super_index'));
router.get('/weibo/oasis/user/:userid', require('./routes/weibo/oasis/user'));

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
router.get('/juejin/posts/:id', require('./routes/juejin/posts'));
router.get('/juejin/collections/:userId', require('./routes/juejin/favorites'));
router.get('/juejin/collection/:collectionId', require('./routes/juejin/collection'));
router.get('/juejin/shares/:userId', require('./routes/juejin/shares'));

// 自如
router.get('/ziroom/room/:city/:iswhole/:room/:keyword', require('./routes/ziroom/room'));

// 简书
router.get('/jianshu/home', require('./routes/jianshu/home'));
router.get('/jianshu/trending/:timeframe', require('./routes/jianshu/trending'));
router.get('/jianshu/collection/:id', require('./routes/jianshu/collection'));
router.get('/jianshu/user/:id', require('./routes/jianshu/user'));

// 知乎
router.get('/zhihu/collection/:id', require('./routes/zhihu/collection'));
router.get('/zhihu/people/activities/:id', require('./routes/zhihu/activities'));
router.get('/zhihu/people/answers/:id', require('./routes/zhihu/answers'));
router.get('/zhihu/people/posts/:id', require('./routes/zhihu/posts'));
router.get('/zhihu/zhuanlan/:id', require('./routes/zhihu/zhuanlan'));
router.get('/zhihu/daily', require('./routes/zhihu/daily'));
router.get('/zhihu/daily/section/:sectionId', require('./routes/zhihu/daily_section'));
router.get('/zhihu/hotlist', require('./routes/zhihu/hotlist'));
router.get('/zhihu/pin/hotlist', require('./routes/zhihu/pin/hotlist'));
router.get('/zhihu/question/:questionId', require('./routes/zhihu/question'));
router.get('/zhihu/topic/:topicId', require('./routes/zhihu/topic'));
router.get('/zhihu/people/pins/:id', require('./routes/zhihu/pin/people'));
router.get('/zhihu/bookstore/newest', require('./routes/zhihu/bookstore/newest'));
router.get('/zhihu/pin/daily', require('./routes/zhihu/pin/daily'));
router.get('/zhihu/weekly', require('./routes/zhihu/weekly'));

// 妹子图
router.get('/mzitu/home/:type?', require('./routes/mzitu/home'));
router.get('/mzitu/tags', require('./routes/mzitu/tags'));
router.get('/mzitu/category/:category', require('./routes/mzitu/category'));
router.get('/mzitu/post/:id', require('./routes/mzitu/post'));
router.get('/mzitu/tag/:tag', require('./routes/mzitu/tag'));

// pixiv
router.get('/pixiv/user/bookmarks/:id', require('./routes/pixiv/bookmarks'));
router.get('/pixiv/user/illustfollows', require('./routes/pixiv/illustfollow'));
router.get('/pixiv/user/:id/', require('./routes/pixiv/user'));
router.get('/pixiv/ranking/:mode/:date?', require('./routes/pixiv/ranking'));
router.get('/pixiv/search/:keyword/:order?/:r18?', require('./routes/pixiv/search'));

// 豆瓣
router.get('/douban/movie/playing', require('./routes/douban/playing'));
router.get('/douban/movie/playing/:score', require('./routes/douban/playing'));
router.get('/douban/movie/playing/:score/:city', require('./routes/douban/playing'));
router.get('/douban/movie/later', require('./routes/douban/later'));
router.get('/douban/movie/ustop', require('./routes/douban/ustop'));
router.get('/douban/movie/weekly', require('./routes/douban/weekly_best'));
router.get('/douban/movie/classification/:sort?/:score?/:tags?', require('./routes/douban/classification.js'));
router.get('/douban/group/:groupid', require('./routes/douban/group'));
router.get('/douban/explore', require('./routes/douban/explore'));
router.get('/douban/music/latest/:area?', require('./routes/douban/latest_music'));
router.get('/douban/book/latest', require('./routes/douban/latest_book'));
router.get('/douban/event/hot/:locationId', require('./routes/douban/event/hot'));
router.get('/douban/commercialpress/latest', require('./routes/douban/commercialpress/latest'));
router.get('/douban/bookstore', require('./routes/douban/bookstore'));
router.get('/douban/book/rank/:type', require('./routes/douban/book/rank'));
router.get('/douban/doulist/:id', require('./routes/douban/doulist'));
router.get('/douban/explore/column/:id', require('./routes/douban/explore_column'));
router.get('/douban/people/:userid/status', require('./routes/douban/people/status.js'));
router.get('/douban/topic/:id/:sort?', require('./routes/douban/topic.js'));
router.get('/douban/channel/:id/:nav?', require('./routes/douban/channel/topic.js'));
router.get('/douban/channel/:id/subject/:nav', require('./routes/douban/channel/subject.js'));

// 法律白話文運動
router.get('/plainlaw/archives', require('./routes/plainlaw/archives.js'));

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
router.get('/zcfy/index', require('./routes/zcfy/index')); // 废弃
router.get('/zcfy/hot', require('./routes/zcfy/hot'));

// 今日头条
router.get('/jinritoutiao/keyword/:keyword', require('./routes/jinritoutiao/keyword'));

// Disqus
router.get('/disqus/posts/:forum', require('./routes/disqus/posts'));

// Twitter
router.get('/twitter/user/:id/:type?', require('./routes/twitter/user'));
router.get('/twitter/list/:id/:name', require('./routes/twitter/list'));
router.get('/twitter/likes/:id', require('./routes/twitter/likes'));
router.get('/twitter/followings/:id', require('./routes/twitter/followings'));
router.get('/twitter/keyword/:keyword', require('./routes/twitter/keyword'));

// Instagram
router.get('/instagram/user/:id', require('./routes/instagram/user'));
router.get('/instagram/tag/:tag', require('./routes/instagram/tag'));
router.get('/instagram/story/:username', require('./routes/instagram/story'));

// Youtube
router.get('/youtube/user/:username/:embed?', require('./routes/youtube/user'));
router.get('/youtube/channel/:id/:embed?', require('./routes/youtube/channel'));
router.get('/youtube/playlist/:id/:embed?', require('./routes/youtube/playlist'));

// 极客时间
router.get('/geektime/column/:cid', require('./routes/geektime/column'));
router.get('/geektime/news', require('./routes/geektime/news'));

// 界面新闻
router.get('/jiemian/list/:cid', require('./routes/jiemian/list.js'));

// 好奇心日报
router.get('/qdaily/:type/:id', require('./routes/qdaily/index'));

// 爱奇艺
router.get('/iqiyi/dongman/:id', require('./routes/iqiyi/dongman'));
router.get('/iqiyi/user/video/:uid', require('./routes/iqiyi/video'));

// 南方周末
router.get('/infzm/:id', require('./routes/infzm/news'));

// Dribbble
router.get('/dribbble/popular/:timeframe?', require('./routes/dribbble/popular'));
router.get('/dribbble/user/:name', require('./routes/dribbble/user'));
router.get('/dribbble/keyword/:keyword', require('./routes/dribbble/keyword'));

// 斗鱼
router.get('/douyu/room/:id', require('./routes/douyu/room'));

// 虎牙
router.get('/huya/live/:id', require('./routes/huya/live'));

// kingkong直播
router.get('/kingkong/room/:id', require('./routes/kingkong/room'));

// v2ex
router.get('/v2ex/topics/:type', require('./routes/v2ex/topics'));
router.get('/v2ex/post/:postid', require('./routes/v2ex/post'));

// Telegram
router.get('/telegram/channel/:username', require('./routes/telegram/channel'));
router.get('/telegram/stickerpack/:name', require('./routes/telegram/stickerpack'));
router.get('/telegram/blog', require('./routes/telegram/blog'));

// readhub
router.get('/readhub/category/:category', require('./routes/readhub/category'));

// GitHub
router.get('/github/repos/:user', require('./routes/github/repos'));
router.get('/github/trending/:since/:language?', require('./routes/github/trending'));
router.get('/github/issue/:user/:repo/:state?/:labels?', require('./routes/github/issue'));
router.get('/github/pull/:user/:repo', require('./routes/github/pulls'));
router.get('/github/user/followers/:user', require('./routes/github/follower'));
router.get('/github/stars/:user/:repo', require('./routes/github/star'));
router.get('/github/search/:query/:sort?/:order?', require('./routes/github/search'));
router.get('/github/branches/:user/:repo', require('./routes/github/branches'));
router.get('/github/file/:user/:repo/:branch/:filepath+', require('./routes/github/file'));
router.get('/github/starred_repos/:user', require('./routes/github/starred_repos'));
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
router.get('/nytimes/morning_post', require('./routes/nytimes/morning_post'));
router.get('/nytimes/:lang?', require('./routes/nytimes/index'));

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
router.get('/smzdm/haowen/:day?', require('./routes/smzdm/haowen'));
router.get('/smzdm/haowen/fenlei/:name/:sort?', require('./routes/smzdm/haowen_fenlei'));

// 新京报
router.get('/bjnews/:cat', require('./routes/bjnews/news'));

// 停水通知
router.get('/tingshuitz/hangzhou', require('./routes/tingshuitz/hangzhou'));
router.get('/tingshuitz/xiaoshan', require('./routes/tingshuitz/xiaoshan'));
router.get('/tingshuitz/dalian', require('./routes/tingshuitz/dalian'));
router.get('/tingshuitz/guangzhou', require('./routes/tingshuitz/guangzhou'));
router.get('/tingshuitz/dongguan', require('./routes/tingshuitz/dongguan'));
router.get('/tingshuitz/xian', require('./routes/tingshuitz/xian'));
router.get('/tingshuitz/yangjiang', require('./routes/tingshuitz/yangjiang'));
router.get('/tingshuitz/nanjing', require('./routes/tingshuitz/nanjing'));
router.get('/tingshuitz/wuhan', require('./routes/tingshuitz/wuhan'));

// 米哈游
router.get('/mihoyo/bh3/:type', require('./routes/mihoyo/bh3'));
router.get('/mihoyo/bh2/:type', require('./routes/mihoyo/bh2'));

// 新闻联播
router.get('/cctv/xwlb', require('./routes/cctv/xwlb'));
// 央视新闻
router.get('/cctv/:category', require('./routes/cctv/category'));

// 财新博客
router.get('/caixin/blog/:column', require('./routes/caixin/blog'));
// 财新
router.get('/caixin/:column/:category', require('./routes/caixin/category'));
// 财新首页
router.get('/caixin/article', require('./routes/caixin/article'));

// 草榴社区
router.get('/t66y/post/:tid', require('./routes/t66y/post'));
router.get('/t66y/:id/:type?', require('./routes/t66y/index'));

// 色中色
router.get('/sexinsex/:id/:type?', require('./routes/sexinsex/index'));

// 机核
router.get('/gcores/category/:category', require('./routes/gcores/category'));

// 国家地理
router.get('/natgeo/dailyphoto', require('./routes/natgeo/dailyphoto'));
router.get('/natgeo/:cat/:type?', require('./routes/natgeo/natgeo'));

// 一个
router.get('/one', require('./routes/one/index'));

// Firefox
router.get('/firefox/release/:platform', require('./routes/firefox/release'));
router.get('/firefox/addons/:id', require('./routes/firefox/addons'));

// Thunderbird
router.get('/thunderbird/release', require('./routes/thunderbird/release'));

// tuicool
router.get('/tuicool/mags/:type', require('./routes/tuicool/mags'));

// Hexo
router.get('/hexo/next/:url', require('./routes/hexo/next'));
router.get('/hexo/yilia/:url', require('./routes/hexo/yilia'));

// 小米
router.get('/mi/crowdfunding', require('./routes/mi/crowdfunding'));
router.get('/mi/youpin/crowdfunding', require('./routes/mi/youpin/crowdfunding'));
router.get('/mi/youpin/new', require('./routes/mi/youpin/new'));
router.get('/miui/:device/:type?/:region?', require('./routes/mi/miui/index'));
router.get('/mi/bbs/board/:boardId', require('./routes/mi/board'));

// Keep
router.get('/keep/user/:id', require('./routes/keep/user'));

// 起点
router.get('/qidian/chapter/:id', require('./routes/qidian/chapter'));
router.get('/qidian/forum/:id', require('./routes/qidian/forum'));
router.get('/qidian/free/:type?', require('./routes/qidian/free'));
router.get('/qidian/free-next/:type?', require('./routes/qidian/free-next'));

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
router.get('/dongqiudi/special/:id', require('./routes/dongqiudi/special'));
router.get('/dongqiudi/top_news/:id?', require('./routes/dongqiudi/top_news'));

// 维基百科 Wikipedia
router.get('/wikipedia/mainland', require('./routes/wikipedia/mainland'));

// 联合国 United Nations
router.get('/un/scveto', require('./routes/un/scveto'));

// e 公司
router.get('/egsea/flash', require('./routes/egsea/flash'));

// 选股宝
router.get('/xuangubao/subject/:subject_id', require('./routes/xuangubao/subject'));

// 雪球
router.get('/xueqiu/user/:id/:type?', require('./routes/xueqiu/user'));
router.get('/xueqiu/favorite/:id', require('./routes/xueqiu/favorite'));
router.get('/xueqiu/user_stock/:id', require('./routes/xueqiu/user_stock'));
router.get('/xueqiu/fund/:id', require('./routes/xueqiu/fund'));
router.get('/xueqiu/stock_info/:id/:type?', require('./routes/xueqiu/stock_info'));
router.get('/xueqiu/snb/:id', require('./routes/xueqiu/snb'));
router.get('/xueqiu/hots', require('./routes/xueqiu/hots'));

// Greasy Fork
router.get('/greasyfork/:language/:domain?', require('./routes/greasyfork/scripts'));

// LinkedKeeper
router.get('/linkedkeeper/:type/:id?', require('./routes/linkedkeeper/index'));

// 开源中国
router.get('/oschina/news/:category?', require('./routes/oschina/news'));
router.get('/oschina/user/:id', require('./routes/oschina/user'));
router.get('/oschina/u/:id', require('./routes/oschina/u'));
router.get('/oschina/topic/:topic', require('./routes/oschina/topic'));

// 安全客
router.get('/aqk/vul', require('./routes/aqk/vul'));
router.get('/aqk/:category', require('./routes/aqk/category'));

// 腾讯游戏开发者社区
router.get('/gameinstitute/community/:tag?', require('./routes/tencent/gameinstitute/community'));

// 腾讯视频 SDK
router.get('/qcloud/mlvb/changelog', require('./routes/tencent/qcloud/mlvb/changelog'));

// 腾讯吐个槽
router.get('/tucaoqq/post/:project/:key', require('./routes/tencent/tucaoqq/post'));

// Bugly SDK
router.get('/bugly/changelog/:platform', require('./routes/tencent/bugly/changelog'));

// wechat
router.get('/wechat/wemp/:id', require('./routes/tencent/wechat/wemp'));
router.get('/wechat/csm/:id', require('./routes/tencent/wechat/csm'));
router.get('/wechat/ce/:id', require('./routes/tencent/wechat/ce'));
router.get('/wechat/announce', require('./routes/tencent/wechat/announce'));
router.get('/wechat/miniprogram/plugins', require('./routes/tencent/wechat/miniprogram/plugins'));
router.get('/wechat/tgchannel/:id', require('./routes/tencent/wechat/tgchannel'));
router.get('/wechat/uread/:userid', require('./routes/tencent/wechat/uread'));
router.get('/wechat/ershicimi/:id', require('./routes/tencent/wechat/ershcimi'));

// All the Flight Deals
router.get('/atfd/:locations/:nearby?', require('./routes/atfd/index'));

// Fir
router.get('/fir/update/:id', require('./routes/fir/update'));

// Nvidia Web Driver
router.get('/nvidia/webdriverupdate', require('./routes/nvidia/webdriverupdate'));

// Google
router.get('/google/citations/:id', require('./routes/google/citations'));
router.get('/google/scholar/:query', require('./routes/google/scholar'));
router.get('/google/doodles/:language?', require('./routes/google/doodles'));
router.get('/google/album/:id', require('./routes/google/album'));
router.get('/google/sites/:id', require('./routes/google/sites'));

// Awesome Pigtals
router.get('/pigtails', require('./routes/pigtails'));

// 每日环球展览 iMuseum
router.get('/imuseum/:city/:type?', require('./routes/imuseum'));

// AppStore
router.get('/appstore/update/:country/:id', require('./routes/apple/appstore/update'));
router.get('/appstore/price/:country/:type/:id', require('./routes/apple/appstore/price'));
router.get('/appstore/iap/:country/:id', require('./routes/apple/appstore/in-app-purchase'));
router.get('/appstore/xianmian', require('./routes/apple/appstore/xianmian'));
router.get('/appstore/gofans', require('./routes/apple/appstore/gofans'));

// Hopper
router.get('/hopper/:lowestOnly/:from/:to?', require('./routes/hopper/index'));

// 马蜂窝
router.get('/mafengwo/note/:type', require('./routes/mafengwo/note'));

// 中国地震局震情速递（与地震台网同步更新）
router.get('/earthquake/:region?', require('./routes/earthquake'));

// 中国地震台网
router.get('/earthquake/ceic/:type', require('./routes/earthquake/ceic'));

// 笔趣阁
router.get('/biquge/novel/latestchapter/:id', require('./routes/novel/biquge'));

// UU看书
router.get('/uukanshu/chapter/:uid', require('./routes/novel/uukanshu'));

// 小说
router.get('/novel/biquge/:id', require('./routes/novel/biquge'));
router.get('/novel/uukanshu/:uid', require('./routes/novel/uukanshu'));
router.get('/novel/wenxuemi/:id1/:id2', require('./routes/novel/wenxuemi'));
router.get('/novel/booksky/:id', require('./routes/novel/booksky'));
router.get('/novel/shuquge/:id', require('./routes/novel/shuquge'));
router.get('/novel/ptwxz/:id1/:id2', require('./routes/novel/ptwxz'));

// 中国气象网
router.get('/weatheralarm', require('./routes/weatheralarm'));

// Gitlab
router.get('/gitlab/explore/:type', require('./routes/gitlab/explore'));

// 忧郁的loli
router.get('/mygalgame', require('./routes/galgame/mmgal')); // 废弃
router.get('/mmgal', require('./routes/galgame/mmgal'));

// say花火
router.get('/sayhuahuo', require('./routes/galgame/sayhuahuo'));

// 终点分享
router.get('/zdfx', require('./routes/galgame/zdfx'));

// 北京理工大学
router.get('/bit/jwc', require('./routes/universities/bit/jwc/jwc'));
router.get('/bit/cs', require('./routes/universities/bit/cs/cs'));

// 大连工业大学
router.get('/dpu/jiaowu/news/:type?', require('./routes/universities/dpu/jiaowu/news'));
router.get('/dpu/wlfw/news/:type?', require('./routes/universities/dpu/wlfw/news'));

// 东南大学
router.get('/seu/radio/academic', require('./routes/universities/seu/radio/academic'));
router.get('/seu/yzb/:type', require('./routes/universities/seu/yzb'));
router.get('/seu/cse/:type?', require('./routes/universities/seu/cse'));

// 南京工业大学
router.get('/njtech/jwc', require('./routes/universities/njtech/jwc'));

// 南京航空航天大学
router.get('/nuaa/jwc/:type?', require('./routes/universities/nuaa/jwc/jwc'));
router.get('/nuaa/cs/:type?', require('./routes/universities/nuaa/cs/index'));
router.get('/nuaa/yjsy/:type?', require('./routes/universities/nuaa/yjsy/yjsy'));

// 哈尔滨工业大学
router.get('/hit/jwc', require('./routes/universities/hit/jwc'));
router.get('/hit/today/:category', require('./routes/universities/hit/today'));

// 上海科技大学
router.get('/shanghaitech/sist/activity', require('./routes/universities/shanghaitech/sist/activity'));

// 上海交通大学
router.get('/sjtu/seiee/academic', require('./routes/universities/sjtu/seiee/academic'));
router.get('/sjtu/seiee/bjwb/:type', require('./routes/universities/sjtu/seiee/bjwb'));
router.get('/sjtu/seiee/xsb/:type?', require('./routes/universities/sjtu/seiee/xsb'));

router.get('/sjtu/gs/tzgg/:type?', require('./routes/universities/sjtu/gs/tzgg'));
router.get('/sjtu/jwc/:type?', require('./routes/universities/sjtu/jwc'));
router.get('/sjtu/tongqu', require('./routes/universities/sjtu/tongqu/activity'));
router.get('/sjtu/yzb/zkxx/:type', require('./routes/universities/sjtu/yzb/zkxx'));

// 江南大学
router.get('/ju/jwc/:type?', require('./routes/universities/ju/jwc'));

// 洛阳理工学院
router.get('/lit/jwc', require('./routes/universities/lit/jwc'));
router.get('/lit/xwzx/:name?', require('./routes/universities/lit/xwzx'));
router.get('/lit/tw/:name?', require('./routes/universities/lit/tw'));

// 清华大学
router.get('/thu/:type', require('./routes/universities/thu/index'));

// 北京大学
router.get('/pku/eecs/:type?', require('./routes/universities/pku/eecs'));
router.get('/pku/rccp/mzyt', require('./routes/universities/pku/rccp/mzyt'));
router.get('/pku/cls/lecture', require('./routes/universities/pku/cls/lecture'));
router.get('/pku/bbs/hot', require('./routes/universities/pku/bbs/hot'));

// 上海海事大学
router.get('/shmtu/www/:type', require('./routes/universities/shmtu/www'));
router.get('/shmtu/jwc/:type', require('./routes/universities/shmtu/jwc'));

// 西南科技大学
router.get('/swust/jwc/news', require('./routes/universities/swust/jwc_news'));
router.get('/swust/jwc/notice/:type?', require('./routes/universities/swust/jwc_notice'));
router.get('/swust/cs/:type?', require('./routes/universities/swust/cs'));

// 华南师范大学
router.get('/scnu/jw', require('./routes/universities/scnu/jw'));
router.get('/scnu/library', require('./routes/universities/scnu/library'));
router.get('/scnu/cs/match', require('./routes/universities/scnu/cs/match'));

// 广东工业大学
router.get('/gdut/news', require('./routes/universities/gdut/news'));

// 中国科学院
router.get('/cas/sim/academic', require('./routes/universities/cas/sim/academic'));

// 中国传媒大学
router.get('/cuc/yz', require('./routes/universities/cuc/yz'));

// 南京邮电大学
router.get('/njupt/jwc/:type?', require('./routes/universities/njupt/jwc'));

// 南昌航空大学
router.get('/nchu/jwc/:type?', require('./routes/universities/nchu/jwc'));

// 哈尔滨工程大学
router.get('/heu/ugs/news/:author?/:category?', require('./routes/universities/heu/ugs/news'));
router.get('/heu/yjsy/:type?', require('./routes/universities/heu/yjsy'));
router.get('/heu/gongxue/:type?', require('./routes/universities/heu/gongxue'));

// 重庆大学
router.get('/cqu/jwc/announcement', require('./routes/universities/cqu/jwc/announcement'));
router.get('/cqu/news/jzyg', require('./routes/universities/cqu/news/jzyg'));

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

// 郑州大学
router.get('/zzu/news/:type', require('./routes/universities/zzu/news'));
router.get('/zzu/soft/news/:type', require('./routes/universities/zzu/soft/news'));

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
router.get('/uestc/auto/:type?', require('./routes/universities/uestc/auto'));
router.get('/uestc/cs/:type?', require('./routes/universities/uestc/cs'));

// 昆明理工大学
router.get('/kmust/jwc/:type?', require('./routes/universities/kmust/jwc'));
router.get('/kmust/job/careers/:type?', require('./routes/universities/kmust/job/careers'));
router.get('/kmust/job/jobfairs', require('./routes/universities/kmust/job/jobfairs'));

// 武汉大学
router.get('/whu/cs/:type', require('./routes/universities/whu/cs'));
router.get('/whu/news/:type?', require('./routes/universities/whu/news'));

// 华中科技大学
router.get('/hust/auto/notice/:type?', require('./routes/universities/hust/aia/notice'));
router.get('/hust/auto/news/', require('./routes/universities/hust/aia/news'));
router.get('/hust/aia/news/', require('./routes/universities/hust/aia/news'));
router.get('/hust/aia/notice/:type?', require('./routes/universities/hust/aia/notice'));

// 井冈山大学
router.get('/jgsu/jwc', require('./routes/universities/jgsu/jwc'));

// 中南大学
router.get('/csu/job/:type?', require('./routes/universities/csu/job'));

// 山东大学
router.get('/sdu/sc/:type?', require('./routes/universities/sdu/sc'));
router.get('/sdu/cs/:type?', require('./routes/universities/sdu/cs'));
router.get('/sdu/cmse/:type?', require('./routes/universities/sdu/cmse'));
router.get('/sdu/mech/:type?', require('./routes/universities/sdu/mech'));
router.get('/sdu/epe/:type?', require('./routes/universities/sdu/epe'));

// 中国海洋大学
router.get('/ouc/it/:type?', require('./routes/universities/ouc/it'));

// 大连大学
router.get('/dlu/jiaowu/news', require('./routes/universities/dlu/jiaowu/news'));

// 东莞理工学院
router.get('/dgut/jwc/:type?', require('./routes/universities/dgut/jwc'));
router.get('/dgut/xsc/:type?', require('./routes/universities/dgut/xsc'));

// 同济大学
router.get('/tju/sse/:type?', require('./routes/universities/tju/sse/notice'));

// 华南理工大学
router.get('/scut/jwc/notice/:category?', require('./routes/universities/scut/jwc/notice'));
router.get('/scut/jwc/news', require('./routes/universities/scut/jwc/news'));

// 温州商学院
router.get('/wzbc/:type?', require('./routes/universities/wzbc/news'));

// 河南大学
router.get('/henu/:type?', require('./routes/universities/henu/news'));

// 天津大学
router.get('/tjpyu/ooa/:type?', require('./routes/universities/tjpyu/ooa'));

// 南开大学
router.get('/nku/jwc/:type?', require('./routes/universities/nku/jwc/index'));

// 北京航空航天大学
router.get('/buaa/news/:type', require('./routes/universities/buaa/news/index'));

// 上海大学
router.get('/shu/jwc/:type?', require('./routes/universities/shu/jwc'));

// 北京科技大学天津学院
router.get('/ustb/tj/news/:type?', require('./routes/universities/ustb/tj/news'));

// 深圳大学
router.get('/szu/yz/:type?', require('./routes/universities/szu/yz'));

// 中国石油大学（华东）
router.get('/upc/main/:type?', require('./routes/universities/upc/main'));
router.get('/upc/jsj/:type?', require('./routes/universities/upc/jsj'));

// 华北水利水电大学
router.get('/ncwu/notice', require('./routes/universities/ncwu/notice'));

// ifanr
router.get('/ifanr/:channel?', require('./routes/ifanr/index'));

// 果壳网
router.get('/guokr/scientific', require('./routes/guokr/scientific'));
router.get('/guokr/:category', require('./routes/guokr/calendar'));

// 联合早报
router.get('/zaobao/realtime/:section?', require('./routes/zaobao/realtime'));
router.get('/zaobao/znews/:section?', require('./routes/zaobao/znews'));
router.get('/zaobao/:type/:section', require('./routes/zaobao/'));

// Apple
router.get('/apple/exchange_repair/:country?', require('./routes/apple/exchange_repair'));

// IPSW.me
router.get('/ipsw/index/:ptype/:pname', require('./routes/ipsw/index'));

// Minecraft CurseForge
router.get('/curseforge/files/:project', require('./routes/curseforge/files'));

// 抖音
router.get('/douyin/user/:id', require('./routes/douyin/user'));
router.get('/douyin/like/:id', require('./routes/douyin/like'));

// 少数派 sspai
router.get('/sspai/series', require('./routes/sspai/series'));
router.get('/sspai/shortcuts', require('./routes/sspai/shortcutsGallery'));
router.get('/sspai/matrix', require('./routes/sspai/matrix'));
router.get('/sspai/column/:id', require('./routes/sspai/column'));
router.get('/sspai/author/:id', require('./routes/sspai/author'));
router.get('/sspai/topics', require('./routes/sspai/topics'));
router.get('/sspai/topic/:id', require('./routes/sspai/topic'));
router.get('/sspai/tag/:keyword', require('./routes/sspai/tag'));
router.get('/sspai/activity/:slug', require('./routes/sspai/activity'));

// 异次元软件世界
router.get('/iplay/home', require('./routes/iplay/home'));

// xclient.info
router.get('/xclient/app/:name', require('./routes/xclient/app'));

// 中国驻外使领事馆
router.get('/embassy/:country/:city?', require('./routes/embassy/index'));

// 澎湃新闻
router.get('/thepaper/featured', require('./routes/thepaper/featured'));
router.get('/thepaper/channel/:id', require('./routes/thepaper/channel'));

// 澎湃美数课
router.get('/thepaper/839studio', require('./routes/thepaper/839studio/studio.js'));
router.get('/thepaper/839studio/:id', require('./routes/thepaper/839studio/category.js'));

// 电影首发站
router.get('/dysfz', require('./routes/dysfz/index'));
router.get('/dysfz/index', require('./routes/dysfz/index')); // 废弃

// きららファンタジア
router.get('/kirara/news', require('./routes/kirara/news'));

// 电影天堂
router.get('/dytt', require('./routes/dytt/index'));
router.get('/dytt/index', require('./routes/dytt/index')); // 废弃

// BT之家
router.get('/btzj/:type?', require('./routes/btzj/index'));

// 人生05电影网
router.get('/rs05/rs05', require('./routes/rs05/rs05'));

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
router.get('/dwnews/rank/:type?/:range?', require('./routes/dwnews/rank'));

// 知晓程序
router.get('/miniapp/article/:category', require('./routes/miniapp/article'));
router.get('/miniapp/store/newest', require('./routes/miniapp/store/newest'));

// 后续
router.get('/houxu/live/:id/:timeline?', require('./routes/houxu/live'));
router.get('/houxu/events', require('./routes/houxu/events'));
router.get('/houxu/lives/:type', require('./routes/houxu/lives'));

// 老司机
router.get('/laosiji/hot', require('./routes/laosiji/hot'));
router.get('/laosiji/feed', require('./routes/laosiji/feed'));
router.get('/laosiji/hotshow/:id', require('./routes/laosiji/hotshow'));

// Scientific American 60-Second Science
router.get('/60s-science/transcript', require('./routes/60s-science/transcript'));

// 99% Invisible
router.get('/99percentinvisible/transcript', require('./routes/99percentinvisible/transcript'));

// 青空文庫
router.get('/aozora/newbook/:count?', require('./routes/aozora/newbook'));

// solidot
router.get('/solidot/:type?', require('./routes/solidot/main'));

// Hermes UK
router.get('/parcel/hermesuk/:tracking', require('./routes/parcel/hermesuk'));

// 数字尾巴
router.get('/dgtle', require('./routes/dgtle/index'));
router.get('/dgtle/whale/category/:category', require('./routes/dgtle/whale'));
router.get('/dgtle/whale/rank/:type/:rule', require('./routes/dgtle/whale_rank'));
router.get('/dgtle/trade/:typeId?', require('./routes/dgtle/trade'));
router.get('/dgtle/trade/search/:keyword', require('./routes/dgtle/keyword'));

// 抽屉新热榜
router.get('/chouti/top/:hour?', require('./routes/chouti/top'));
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
router.get('/acfun/user/video/:uid', require('./routes/acfun/video'));

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
router.get('/gitchat/newest/:category?/:selected?', require('./routes/gitchat/newest'));

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
// Vol
router.get('/vol/:mode?', require('./routes/vol/lastupdate'));
// 咚漫
router.get('/dongmanmanhua/:category/:name/:id', require('./routes/dongmanmanhua/comic'));
// webtoons
router.get('/webtoons/:lang/:category/:name/:id', require('./routes/webtoons/comic'));
router.get('/webtoons/naver/:id', require('./routes/webtoons/naver'));

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
router.get('/9to5/:subsite/:tag?', require('./routes/9to5/subsite'));

// TesterHome
router.get('/testerhome/newest', require('./routes/testerhome/newest'));

// 刷屏
router.get('/weseepro/newest', require('./routes/weseepro/newest'));
router.get('/weseepro/newest-direct', require('./routes/weseepro/newest-direct'));
router.get('/weseepro/circle', require('./routes/weseepro/circle'));

// 玩物志
router.get('/coolbuy/newest', require('./routes/coolbuy/newest'));

// NGA
router.get('/nga/forum/:fid/:recommend?', require('./routes/nga/forum'));
router.get('/nga/post/:tid', require('./routes/nga/post'));

// Nautilus
router.get('/nautilus/topic/:tid', require('./routes/nautilus/topics'));

// JavBus
router.get('/javbus/home', require('./routes/javbus/home'));
router.get('/javbus/genre/:gid', require('./routes/javbus/genre'));
router.get('/javbus/star/:sid', require('./routes/javbus/star'));
router.get('/javbus/series/:seriesid', require('./routes/javbus/series'));
router.get('/javbus/uncensored/home', require('./routes/javbus/uncensored/home'));
router.get('/javbus/uncensored/genre/:gid', require('./routes/javbus/uncensored/genre'));
router.get('/javbus/uncensored/star/:sid', require('./routes/javbus/uncensored/star'));
router.get('/javbus/uncensored/series/:seriesid', require('./routes/javbus/uncensored/series'));
router.get('/javbus/western/home', require('./routes/javbus/western/home'));
router.get('/javbus/western/genre/:gid', require('./routes/javbus/western/genre'));
router.get('/javbus/western/star/:sid', require('./routes/javbus/western/star'));
router.get('/javbus/western/series/:seriesid', require('./routes/javbus/western/series'));

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
router.get('/cpu/home', require('./routes/universities/cpu/home'));
router.get('/cpu/jwc', require('./routes/universities/cpu/jwc'));
router.get('/cpu/yjsy', require('./routes/universities/cpu/yjsy'));

// 字幕组
router.get('/zimuzu/resource/:id?', require('./routes/zimuzu/resource'));

// 虎嗅
router.get('/huxiu/tag/:id', require('./routes/huxiu/tag'));
router.get('/huxiu/search/:keyword', require('./routes/huxiu/search'));
router.get('/huxiu/author/:id', require('./routes/huxiu/author'));
router.get('/huxiu/article', require('./routes/huxiu/article'));

// Steam
router.get('/steam/search/:params', require('./routes/steam/search'));
router.get('/steam/news/:appids', require('./routes/steam/news'));

// Steamgifts
router.get('/steamgifts/discussions/:category?', require('./routes/steam/steamgifts/discussions'));

// 扇贝
router.get('/shanbay/checkin/:id', require('./routes/shanbay/checkin'));
router.get('/shanbay/footprints/:category?', require('./routes/shanbay/footprints'));

// Facebook
router.get('/facebook/page/:id', require('./routes/facebook/page'));

// 币乎
router.get('/bihu/activaties/:id', require('./routes/bihu/activaties'));

// 停电通知
router.get('/tingdiantz/nanjing', require('./routes/tingdiantz/nanjing'));

// 36kr
router.get('/36kr/search/article/:keyword', require('./routes/36kr/search/article'));
router.get('/36kr/newsflashes', require('./routes/36kr/newsflashes'));

// PMCAFF
router.get('/pmcaff/list/:typeid', require('./routes/pmcaff/list'));
router.get('/pmcaff/feed/:typeid', require('./routes/pmcaff/feed'));

// icourse163
router.get('/icourse163/newest', require('./routes/icourse163/newest'));

// patchwork.kernel.org
router.get('/patchwork.kernel.org/comments/:id', require('./routes/patchwork.kernel.org/comments'));

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
router.get('/cyzone/label/:name', require('./routes/cyzone/label'));

// 政府
router.get('/gov/zhengce/zuixin', require('./routes/gov/zhengce/zuixin'));
router.get('/gov/zhengce/wenjian/:pcodeJiguan?', require('./routes/gov/zhengce/wenjian'));
router.get('/gov/zhengce/govall/:advance?', require('./routes/gov/zhengce/govall'));
router.get('/gov/province/:name/:category', require('./routes/gov/province'));
router.get('/gov/city/:name/:category', require('./routes/gov/city'));
router.get('/gov/statecouncil/briefing', require('./routes/gov/statecouncil/briefing'));
router.get('/gov/news/:uid', require('./routes/gov/news'));

// 苏州
router.get('/gov/suzhou/news/:uid', require('./routes/gov/suzhou/news'));
router.get('/gov/suzhou/doc', require('./routes/gov/suzhou/doc'));

// 江苏
router.get('/gov/jiangsu/eea/:type?', require('./routes/gov/jiangsu/eea'));

// 山西
router.get('/gov/shanxi/rst/:category', require('./routes/gov/shanxi/rst'));

// 湖南
router.get('/gov/hunan/notice/:type', require('./routes/gov/hunan/notice'));

// 中华人民共和国-海关总署
router.get('/gov/customs/list/:gchannel', require('./routes/gov/customs/list'));

// 中华人民共和国生态环境部
router.get('/gov/mee/gs', require('./routes/gov/mee/gs'));

// 中华人民共和国教育部
router.get('/gov/moe/:type', require('./routes/gov/moe/moe'));

// 中华人民共和国外交部
router.get('/gov/fmprc/fyrbt', require('./routes/gov/fmprc/fyrbt'));

// 国家新闻出版广电总局
router.get('/gov/sapprft/approval/:channel/:detail?', require('./routes/gov/sapprft/7026'));

// 北京卫生健康委员会
router.get('/gov/beijing/mhc/:caty', require('./routes/gov/beijing/mhc'));

// 小黑盒
router.get('/xiaoheihe/user/:id', require('./routes/xiaoheihe/user'));
router.get('/xiaoheihe/news', require('./routes/xiaoheihe/news'));
router.get('/xiaoheihe/discount', require('./routes/xiaoheihe/discount'));

// 惠誉评级
router.get('/fitchratings/site/:type', require('./routes/fitchratings/site'));

// 移动支付
router.get('/mpaypass/news', require('./routes/mpaypass/news'));
router.get('/mpaypass/main/:type?', require('./routes/mpaypass/main'));

// 新浪科技探索
router.get('/sina/discovery/:type', require('./routes/sina/discovery'));

// 新浪科技滚动新闻
router.get('/sina/rollnews', require('./routes/sina/rollnews'));

// 新浪专栏创事记
router.get('/sina/csj', require('./routes/sina/chuangshiji'));

// Animen
router.get('/animen/news/:type', require('./routes/animen/news'));

// D2 资源库
router.get('/d2/daily', require('./routes/d2/daily'));

// ebb
router.get('/ebb', require('./routes/ebb'));

// Indienova
router.get('/indienova/:type', require('./routes/indienova/article'));

// JPMorgan Chase Institute
router.get('/jpmorganchase', require('./routes/jpmorganchase/research'));

// 美拍
router.get('/meipai/user/:uid', require('./routes/meipai/user'));

// 多知网
router.get('/duozhi', require('./routes/duozhi'));

// Docker Hub
router.get('/dockerhub/build/:owner/:image/:tag?', require('./routes/dockerhub/build'));

// 人人都是产品经理
router.get('/woshipm/popular', require('./routes/woshipm/popular'));
router.get('/woshipm/wen', require('./routes/woshipm/wen'));
router.get('/woshipm/bookmarks/:id', require('./routes/woshipm/bookmarks'));
router.get('/woshipm/user_article/:id', require('./routes/woshipm/user_article'));

// 高清电台
router.get('/gaoqing/latest', require('./routes/gaoqing/latest'));

// 轻小说文库
router.get('/wenku8/chapter/:id', require('./routes/wenku8/chapter'));

// 鲸跃汽车
router.get('/whalegogo/home', require('./routes/whalegogo/home'));
router.get('/whalegogo/portal/:type_id/:tagid?/', require('./routes/whalegogo/portal'));

// 爱思想
router.get('/aisixiang/column/:id', require('./routes/aisixiang/column'));
router.get('/aisixiang/ranking/:type?/:range?', require('./routes/aisixiang/ranking'));

// Hacker News
router.get('/hackernews/:section/:type?', require('./routes/hackernews/story'));

// LeetCode
router.get('/leetcode/articles', require('./routes/leetcode/articles'));
router.get('/leetcode/submission/us/:user', require('./routes/leetcode/check-us'));
router.get('/leetcode/submission/cn/:user', require('./routes/leetcode/check-cn'));

// segmentfault
router.get('/segmentfault/channel/:name', require('./routes/segmentfault/channel'));

// 虎扑
router.get('/hupu/bxj/:id/:order?', require('./routes/hupu/bbs'));
router.get('/hupu/bbs/:id/:order?', require('./routes/hupu/bbs'));

// 牛客网
router.get('/nowcoder/discuss/:type/:order', require('./routes/nowcoder/discuss'));

// Xiaomi.eu
router.get('/xiaomieu/releases', require('./routes/xiaomieu/releases'));

// sketch.com
router.get('/sketch/beta', require('./routes/sketch/beta'));
router.get('/sketch/updates', require('./routes/sketch/updates'));

// 每日安全
router.get('/security/pulses', require('./routes/security/pulses'));

// DoNews
router.get('/donews/:column?', require('./routes/donews/index'));

// WeGene
router.get('/wegene/column/:type/:category', require('./routes/wegene/column'));
router.get('/wegene/newest', require('./routes/wegene/newest'));

// instapaper
router.get('/instapaper/person/:name', require('./routes/instapaper/person'));

// UI 中国
router.get('/ui-cn/article', require('./routes/ui-cn/article'));
router.get('/ui-cn/user/:id', require('./routes/ui-cn/user'));

// Dcard
router.get('/dcard/:section/:type?', require('./routes/dcard/section'));

// 12306
router.get('/12306/zxdt/:id?', require('./routes/12306/zxdt'));

// 北京天文馆每日一图
router.get('/bjp/apod', require('./routes/bjp/apod'));

// 洛谷
router.get('/luogu/daily/:id?', require('./routes/luogu/daily'));
router.get('/luogu/contest', require('./routes/luogu/contest'));

// 决胜网
router.get('/juesheng', require('./routes/juesheng'));

// 播客IBCラジオ イヤーマイッタマイッタ
router.get('/maitta', require('./routes/maitta'));

// 一些博客
// 敬维-以认真的态度做完美的事情: https://jingwei.link/
router.get('/blogs/jingwei.link', require('./routes/blogs/jingwei_link'));

// 王垠的博客-当然我在扯淡
router.get('/blogs/wangyin', require('./routes/blogs/wangyin'));

// 王五四文集
router.get('/blogs/wang54/:id?', require('./routes/blogs/wang54'));

// 裏垢女子まとめ
router.get('/uraaka-joshi', require('./routes/uraaka-joshi/uraaka-joshi'));
router.get('/uraaka-joshi/:id', require('./routes/uraaka-joshi/uraaka-joshi-user'));

// 西祠胡同
router.get('/xici/:id?', require('./routes/xici'));

// 淘股吧论坛
router.get('/taoguba/index', require('./routes/taoguba/index'));
router.get('/taoguba/user/:uid', require('./routes/taoguba/user'));

// 今日热榜
router.get('/tophub/:id', require('./routes/tophub'));

// 游戏时光
router.get('/vgtime/news', require('./routes/vgtime/news.js'));
router.get('/vgtime/release', require('./routes/vgtime/release'));
router.get('/vgtime/keyword/:keyword', require('./routes/vgtime/keyword'));

// MP4吧
router.get('/mp4ba/:param', require('./routes/mp4ba'));

// anitama
router.get('/anitama/:channel?', require('./routes/anitama/channel'));

// 親子王國
router.get('/babykingdom/:id/:order?', require('./routes/babykingdom'));

// 四川大学
router.get('/scu/jwc/notice', require('./routes/universities/scu/jwc'));
router.get('/scu/xg/notice', require('./routes/universities/scu/xg'));

// 浙江工商大学
router.get('/zjgsu/tzgg', require('./routes/universities/zjgsu/tzgg/scripts'));
router.get('/zjgsu/gsgg', require('./routes/universities/zjgsu/gsgg/scripts'));
router.get('/zjgsu/xszq', require('./routes/universities/zjgsu/xszq/scripts'));

// 大众点评
router.get('/dianping/user/:id?', require('./routes/dianping/user'));

// 半月谈
router.get('/banyuetan/:name', require('./routes/banyuetan'));

// 人民日报
router.get('/people/opinion/:id', require('./routes/people/opinion'));
router.get('/people/env/:id', require('./routes/people/env'));
router.get('/people/xjpjh/:keyword?/:year?', require('./routes/people/xjpjh'));

// 北极星电力网
router.get('/bjx/huanbao', require('./routes/bjx/huanbao'));

// gamersky
router.get('/gamersky/news', require('./routes/gamersky/news'));
router.get('/gamersky/ent/:category', require('./routes/gamersky/ent'));

// 游研社
router.get('/yystv/category/:category', require('./routes/yystv/category'));

// psnine
router.get('/psnine/index', require('./routes/psnine/index'));
router.get('/psnine/shuzhe', require('./routes/psnine/shuzhe'));
router.get('/psnine/trade', require('./routes/psnine/trade'));
router.get('/psnine/game', require('./routes/psnine/game'));
router.get('/psnine/news', require('./routes/psnine/news'));

// 浙江大学
router.get('/zju/list/:type', require('./routes/universities/zju/list'));
router.get('/zju/physics/:type', require('./routes/universities/zju/physics'));
router.get('/zju/grs/:type', require('./routes/universities/zju/grs'));
router.get('/zju/career/:type', require('./routes/universities/zju/career'));
router.get('/zju/cst/:type', require('./routes/universities/zju/cst'));

// 浙江大学城市学院
router.get('/zucc/news/latest', require('./routes/universities/zucc/news'));
router.get('/zucc/cssearch/latest/:webVpn/:key/', require('./routes/universities/zucc/cssearch'));

// 华中师范大学
router.get('/ccnu/career', require('./routes/universities/ccnu/career'));

// Infoq
router.get('/infoq/recommend', require('./routes/infoq/recommend'));
router.get('/infoq/topic/:id', require('./routes/infoq/topic'));

// checkee
router.get('/checkee/:dispdate', require('./routes/checkee/index'));

// 艾瑞
router.get('/iresearch/report', require('./routes/iresearch/report'));

// ZAKER
router.get('/zaker/:type/:id', require('./routes/zaker/source'));

// Matters
router.get('/matters/topics', require('./routes/matters/topics'));
router.get('/matters/latest', require('./routes/matters/latest'));
router.get('/matters/hot', require('./routes/matters/hot'));
router.get('/matters/tags/:tid', require('./routes/matters/tags'));
router.get('/matters/author/:uid', require('./routes/matters/author'));

// MobData
router.get('/mobdata/report', require('./routes/mobdata/report'));

// 谷雨
router.get('/tencent/guyu/channel/:name', require('./routes/tencent/guyu/channel'));

// 古诗文网
router.get('/gushiwen/recommend', require('./routes/gushiwen/recommend'));

// 电商在线
router.get('/imaijia/category/:category', require('./routes/imaijia/category'));

// 21财经
router.get('/21caijing/channel/:name', require('./routes/21caijing/channel'));

// 北京邮电大学
router.get('/bupt/yz/:type', require('./routes/universities/bupt/yz'));
router.get('/bupt/grs', require('./routes/universities/bupt/grs'));
router.get('/bupt/portal', require('./routes/universities/bupt/portal'));
router.get('/bupt/news', require('./routes/universities/bupt/news'));

// VOCUS 方格子
router.get('/vocus/publication/:id', require('./routes/vocus/publication'));
router.get('/vocus/user/:id', require('./routes/vocus/user'));

// 一亩三分地 1point3acres
router.get('/1point3acres/user/:id/threads', require('./routes/1point3acres/threads'));
router.get('/1point3acres/user/:id/posts', require('./routes/1point3acres/posts'));
router.get('/1point3acres/offer/:year?/:major?/:school?', require('./routes/1point3acres/offer'));

// 广东海洋大学
router.get('/gdoujwc', require('./routes/universities/gdou/jwc/jwtz'));

// 中国高清网
router.get('/gaoqingla/:tag?', require('./routes/gaoqingla/latest'));

// 马良行
router.get('/mlhang', require('./routes/mlhang/latest'));

// PlayStation Store
router.get('/ps/list/:gridName', require('./routes/ps/list'));
router.get('/ps/trophy/:id', require('./routes/ps/trophy'));
router.get('/ps/ps4updates', require('./routes/ps/ps4updates'));

// Quanta Magazine
router.get('/quantamagazine/archive', require('./routes/quantamagazine/archive'));

// Nintendo
router.get('/nintendo/eshop/jp', require('./routes/nintendo/eshop_jp'));
router.get('/nintendo/eshop/hk', require('./routes/nintendo/eshop_hk'));
router.get('/nintendo/eshop/us', require('./routes/nintendo/eshop_us'));
router.get('/nintendo/news', require('./routes/nintendo/news'));
router.get('/nintendo/direct', require('./routes/nintendo/direct'));
router.get('/nintendo/system-update', require('./routes/nintendo/system-update'));

// 世界卫生组织
router.get('/who/news-room/:type', require('./routes/who/news-room'));

// 福利资源-met.red
router.get('/metred/fuli', require('./routes/metred/fuli'));

// MIT
router.get('/mit/graduateadmissions/:type/:name', require('./routes/universities/mit/graduateadmissions'));

// 毕马威
router.get('/kpmg/insights', require('./routes/kpmg/insights'));

// Saraba1st
router.get('/saraba1st/thread/:tid', require('./routes/saraba1st/thread'));

// gradcafe
router.get('/gradcafe/result/:type', require('./routes/gradcafe/result'));
router.get('/gradcafe/result', require('./routes/gradcafe/result'));

// The Economist
router.get('/the-economist/gre-vocabulary', require('./routes/the-economist/gre-vocabulary'));
router.get('/the-economist/:endpoint', require('./routes/the-economist/full'));

// 鼠绘漫画
router.get('/shuhui/comics/:id', require('./routes/shuhui/comics'));

// 朝日新聞中文网（简体中文版）
router.get('/asahichinese-j/:category/:subCate', require('./routes/asahichinese-j/index'));
router.get('/asahichinese-j/:category', require('./routes/asahichinese-j/index'));

// 朝日新聞中文網（繁體中文版）
router.get('/asahichinese-f/:category/:subCate', require('./routes/asahichinese-f/index'));
router.get('/asahichinese-f/:category', require('./routes/asahichinese-f/index'));

// 7x24小时快讯
router.get('/fx678/kx', require('./routes/fx678/kx'));

// SoundCloud
router.get('/soundcloud/tracks/:user', require('./routes/soundcloud/tracks'));

// dilidili
router.get('/dilidili/fanju/:id', require('./routes/dilidili/fanju'));

// 且听风吟福利
router.get('/qtfyfl/:category', require('./routes/qtfyfl/category'));

// 派代
router.get('/paidai', require('./routes/paidai/index'));
router.get('/paidai/bbs', require('./routes/paidai/bbs'));
router.get('/paidai/news', require('./routes/paidai/news'));

// 中国银行
router.get('/boc/whpj/:format?', require('./routes/boc/whpj'));

// 漫画db
router.get('/manhuadb/comics/:id', require('./routes/manhuadb/comics'));

// 装备前线
router.get('/zfrontier/postlist/:type', require('./routes/zfrontier/postlist'));

// 观察者风闻话题
router.get('/guanchazhe/topic/:id', require('./routes/guanchazhe/topic'));
router.get('/guanchazhe/personalpage/:uid', require('./routes/guanchazhe/personalpage'));
router.get('/guanchazhe/index/:type', require('./routes/guanchazhe/index'));

// Hpoi 手办维基
router.get('/hpoi/info/:type?', require('./routes/hpoi/info'));
router.get('/hpoi/:category/:words', require('./routes/hpoi'));

// 通用CurseForge
router.get('/curseforge/:gameid/:catagoryid/:projectid/files', require('./routes/curseforge/generalfiles'));

// 西南财经大学
router.get('/swufe/seie/:type?', require('./routes/universities/swufe/seie'));

// Wired
router.get('/wired/tag/:tag', require('./routes/wired/tag'));

// 语雀文档
router.get('/yuque/doc/:repo_id', require('./routes/yuque/doc'));

// 飞地
router.get('/enclavebooks/category/:id?', require('./routes/enclavebooks/category'));
router.get('/enclavebooks/user/:uid', require('./routes/enclavebooks/user.js'));
router.get('/enclavebooks/collection/:uid', require('./routes/enclavebooks/collection.js'));

// 色花堂 - 色花图片版块
router.get('/dsndsht23/picture/:subforumid', require('./routes/dsndsht23/pictures'));

// 色花堂 - 原创bt电影
router.get('/dsndsht23/bt/:subforumid?', require('./routes/dsndsht23/index'));
router.get('/dsndsht23/:subforumid?/:type?', require('./routes/dsndsht23/index'));
router.get('/dsndsht23/:subforumid?', require('./routes/dsndsht23/index'));
router.get('/dsndsht23', require('./routes/dsndsht23/index'));

// 数英网最新文章
router.get('/digitaling/index', require('./routes/digitaling/index'));

// 数英网文章专题
router.get('/digitaling/articles/:category/:subcate', require('./routes/digitaling/article'));

// 数英网项目专题
router.get('/digitaling/projects/:category', require('./routes/digitaling/project'));

// Bing壁纸
router.get('/bing', require('./routes/bing/index'));

// Maxjia News - DotA 2
router.get('/maxnews/dota2', require('./routes/maxnews/dota2'));

// 柠檬 - 私房歌
router.get('/ningmeng/song', require('./routes/ningmeng/song'));

// 紫竹张
router.get('/zzz', require('./routes/zzz/index'));

// AEON
router.get('/aeon/:cid', require('./routes/aeon/category'));

// AlgoCasts
router.get('/algocasts', require('./routes/algocasts/all'));

// aqicn
router.get('/aqicn/:city', require('./routes/aqicn/index'));

// 猫眼电影
router.get('/maoyan/hot', require('./routes/maoyan/hot'));
router.get('/maoyan/upcoming', require('./routes/maoyan/upcoming'));

// cnBeta
router.get('/cnbeta', require('./routes/cnbeta/home'));

// 国家退伍士兵信息
router.get('/gov/veterans/:type', require('./routes/gov/veterans/china'));

// 河北省退伍士兵信息
router.get('/gov/veterans/hebei/:type', require('./routes/gov/veterans/hebei'));

// Dilbert Comic Strip
router.get('/dilbert/strip', require('./routes/dilbert/strip'));

// 游戏打折情报
router.get('/yxdzqb/:type', require('./routes/yxdzqb'));

// 怪物猎人
router.get('/monsterhunter/update', require('./routes/mhw/update'));
router.get('/mhw/update', require('./routes/mhw/update'));
router.get('/mhw/news', require('./routes/mhw/news'));

// 005.tv
router.get('/005tv/zx/latest', require('./routes/005tv/zx'));

// Polimi News
router.get('/polimi/news/:language?', require('./routes/polimi/news'));

// dekudeals
router.get('/dekudeals/:type', require('./routes/dekudeals'));

// 直播吧
router.get('/zhibo8/forum/:id', require('./routes/zhibo8/forum'));
router.get('/zhibo8/post/:id', require('./routes/zhibo8/post'));

// 东方网-上海
router.get('/eastday/sh', require('./routes/eastday/sh'));

// Metacritic
router.get('/metacritic/release/:platform/:type/:sort?', require('./routes/metacritic/release'));

// 快科技（原驱动之家）
router.get('/kkj/news', require('./routes/kkj/news'));

// Outage.Report
router.get('/outagereport/:name/:count?', require('./routes/outagereport/service'));

// sixthtone
router.get('/sixthtone/news', require('./routes/sixthtone/news'));

// AI研习社
router.get('/aiyanxishe/:id/:sort?', require('./routes/aiyanxishe/home'));

// 活动行
router.get('/huodongxing/explore', require('./routes/hdx/explore'));

// 飞客茶馆优惠信息
router.get('/flyertea/preferential', require('./routes/flyertea/preferential'));
router.get('/flyertea/creditcard/:bank', require('./routes/flyertea/creditcard'));

// 中国广播
router.get('/radio/:channelname/:name', require('./routes/radio/radio'));

// TOPYS
router.get('/topys/:category', require('./routes/topys/article'));

// 巴比特作者专栏
router.get('/8btc/:authorid', require('./routes/8btc/author'));
router.get('/8btc/news/flash', require('./routes/8btc/news/flash'));

// VueVlog
router.get('/vuevideo/:userid', require('./routes/vuevideo/user'));

// 证监会
router.get('/csrc/news/:suffix?', require('./routes/csrc/news'));
router.get('/csrc/fashenwei', require('./routes/csrc/fashenwei'));
router.get('/csrc/auditstatus/:apply_id', require('./routes/csrc/auditstatus'));

// LWN.net Alerts
router.get('/lwn/alerts/:distributor', require('./routes/lwn/alerts'));

// 唱吧
router.get('/changba/:userid', require('./routes/changba/user'));

// 英雄联盟
router.get('/lol/newsindex/:type', require('./routes/lol/newsindex'));

// 掌上英雄联盟
router.get('/lolapp/recommend', require('./routes/lolapp/recommend'));

// 左岸读书
router.get('/zreading', require('./routes/zreading/home'));

// NBA
router.get('/nba/app_news', require('./routes/nba/app_news'));

// 天津产权交易中心
router.get('/tprtc/cqzr', require('./routes/tprtc/cqzr'));
router.get('/tprtc/qyzc', require('./routes/tprtc/qyzc'));
router.get('/tprtc/news', require('./routes/tprtc/news'));

// ArchDaily
router.get('/archdaily', require('./routes/archdaily/home'));

// aptonic Dropzone actions
router.get('/aptonic/action', require('./routes/aptonic/action'));

// 印记中文周刊
router.get('/docschina/jsweekly', require('./routes/docschina/jsweekly'));

// im2maker
router.get('/im2maker/:channel?', require('./routes/im2maker/index'));

// 巨潮资讯
router.get('/cninfo/announcement/:code?/:category?', require('./routes/cninfo/announcement'));
router.get('/cninfo/stock_announcement/:code', require('./routes/cninfo/stock_announcement'));
router.get('/cninfo/fund_announcement/:code?/:searchkey?', require('./routes/cninfo/fund_announcement'));

// 中央纪委国家监委网站
router.get('/ccdi/scdc', require('./routes/ccdi/scdc'));

// 香水时代
router.get('/nosetime/:id/:type/:sort?', require('./routes/nosetime/comment'));
router.get('/nosetime/home', require('./routes/nosetime/home'));

// 涂鸦王国
router.get('/gracg/:user/:love?', require('./routes/gracg/user'));

// 大侠阿木
router.get('/daxiaamu/home', require('./routes/daxiaamu/home'));

// 美团技术团队
router.get('/meituan/tech/home', require('./routes//meituan/tech/home'));

// 码农网
router.get('/codeceo/home', require('./routes/codeceo/home'));
router.get('/codeceo/:type/:category?', require('./routes/codeceo/category'));

// BOF
router.get('/bof/home', require('./routes/bof/home'));

// 爱发电
router.get('/afdian/explore/:type?/:category?', require('./routes/afdian/explore'));
router.get('/afdian/dynamic/:uid', require('./routes/afdian/dynamic'));

// Simons Foundation
router.get('/simonsfoundation/articles', require('./routes/simonsfoundation/articles'));
router.get('/simonsfoundation/recommend', require('./routes/simonsfoundation/recommend'));

// 王者荣耀
router.get('/pvp/newsindex/:type', require('./routes/pvp/newsindex'));

// 《明日方舟》游戏
router.get('/arknights/news', require('./routes/arknights/news'));

// ff14
router.get('/ff14/ff14_zh/:type', require('./routes/ff14/ff14_zh'));

// 学堂在线
router.get('/xuetangx/course/:cid/:type', require('./routes/xuetangx/course_info'));
router.get('/xuetangx/course/list/:mode/:credential/:status/:type?', require('./routes/xuetangx/course_list'));

// wikihow
router.get('/wikihow/index', require('./routes/wikihow/index.js'));
router.get('/wikihow/category/:category/:type', require('./routes/wikihow/category.js'));

// 正版中国
router.get('/getitfree/category/:category?', require('./routes/getitfree/category.js'));
router.get('/getitfree/search/:keyword?', require('./routes/getitfree/search.js'));

// 万联网
router.get('/10000link/news/:category?', require('./routes/10000link/news'));

// 站酷
router.get('/zcool/recommend/:type', require('./routes/zcool/recommend'));
router.get('/zcool/top', require('./routes/zcool/top'));
router.get('/zcool/user/:uid', require('./routes/zcool/user'));

// 第一财经
router.get('/yicai/brief', require('./routes/yicai/brief.js'));

// 一兜糖
router.get('/yidoutang/index', require('./routes/yidoutang/index.js'));
router.get('/yidoutang/guide', require('./routes/yidoutang/guide.js'));
router.get('/yidoutang/mtest', require('./routes/yidoutang/mtest.js'));
router.get('/yidoutang/case/:type', require('./routes/yidoutang/case.js'));

// 开眼
router.get('/kaiyan/index', require('./routes/kaiyan/index'));

// 龙空
router.get('/lkong/forum/:id/:digest?', require('./routes/lkong/forum'));
router.get('/lkong/thread/:id', require('./routes/lkong/thread'));
// router.get('/lkong/user/:id', require('./routes/lkong/user'));

// 坂道系列官网新闻
router.get('/nogizaka46/news', require('./routes/nogizaka46/news'));
router.get('/keyakizaka46/news', require('./routes/keyakizaka46/news'));
router.get('/hinatazaka46/news', require('./routes/hinatazaka46/news'));

// 阿里云
router.get('/aliyun/database_month', require('./routes/aliyun/database_month'));
router.get('/aliyun/notice/:type?', require('./routes/aliyun/notice'));

// 礼物说
router.get('/liwushuo/index', require('./routes/liwushuo/index.js'));

// 故事fm
router.get('/storyfm/index', require('./routes/storyfm/index.js'));

// 中国日报
router.get('/chinadaily/english/:category', require('./routes/chinadaily/english.js'));

// leboncoin
router.get('/leboncoin/ad/:query', require('./routes/leboncoin/ad.js'));

// DHL
router.get('/dhl/:id', require('./routes/dhl/shipment-tracking'));

// Japanpost
router.get('/japanpost/:reqCode', require('./routes/japanpost/index'));

// 中华人民共和国商务部
router.get('/mofcom/article/:suffix', require('./routes/mofcom/article'));

// 字幕库
router.get('/zimuku/:type?', require('./routes/zimuku/index'));

// 品玩
router.get('/pingwest/status', require('./routes/pingwest/status'));
router.get('/pingwest/tag/:tag/:type', require('./routes/pingwest/tag'));
router.get('/pingwest/user/:uid/:type?', require('./routes/pingwest/user'));

// Hanime
router.get('/hanime/video', require('./routes/hanime/video'));

// 篝火营地
router.get('/gouhuo/news/:category', require('./routes/gouhuo'));
router.get('/gouhuo/strategy', require('./routes/gouhuo/strategy'));

// Soul
router.get('/soul/:id', require('./routes/soul'));

// 单向空间
router.get('/owspace/read/:type?', require('./routes/owspace/read'));

// 天涯论坛
router.get('/tianya/index/:type', require('./routes/tianya/index'));
router.get('/tianya/user/:userid', require('./routes/tianya/user'));
router.get('/tianya/comments/:userid', require('./routes/tianya/comments'));

// eleme
router.get('/eleme/open/announce', require('./routes/eleme/open/announce'));
router.get('/eleme/open-be/announce', require('./routes/eleme/open-be/announce'));

// 微信开放社区
router.get('/wechat-open/community/:type', require('./routes/tencent/wechat/wechat-open/community/announce'));
// 微信支付 - 商户平台公告
router.get('/wechat-open/pay/announce', require('./routes/tencent/wechat/wechat-open/pay/announce'));
router.get('/wechat-open/community/:type/:category', require('./routes/tencent/wechat/wechat-open/community/question'));

// 微店
router.get('/weidian/goods/:id', require('./routes/weidian/goods'));

// 有赞
router.get('/youzan/goods/:id', require('./routes/youzan/goods'));
// 币世界快讯
router.get('/bishijie/kuaixun', require('./routes/bishijie/kuaixun'));

// 顺丰丰桥
router.get('/sf/sffq-announce', require('./routes/sf/sffq-announce'));

// 缺书网
router.get('/queshu/sale', require('./routes/queshu/sale'));
router.get('/queshu/book/:bookid', require('./routes/queshu/book'));

// SANS
router.get('/sans/summit_archive', require('./routes/sans/summit_archive'));

// LaTeX 开源小屋
router.get('/latexstudio/home', require('./routes/latexstudio/home'));

// 上证债券信息网 - 可转换公司债券公告
router.get('/sse/convert/:query?', require('./routes/sse/convert'));
router.get('/sse/renewal/', require('./routes/sse/renewal'));
router.get('/sse/inquire/', require('./routes/sse/inquire'));

// 深圳证券交易所——上市公告
router.get('/szse/notice/', require('./routes/szse/notice'));
router.get('/szse/inquire/:type', require('./routes/szse/inquire'));

// 前端艺术家每日整理&&飞冰早报
router.get('/jskou/:type?', require('./routes/jskou/index'));

// 国家应急广播
router.get('/cneb/yjxx', require('./routes/cneb/yjxx'));
router.get('/cneb/guoneinews', require('./routes/cneb/guoneinews'));

// 邮箱
router.get('/mail/imap/:email', require('./routes/mail/imap'));

// 好队友
router.get('/network360/jobs', require('./routes/network360/jobs'));

// 智联招聘
router.get('/zhilian/:city/:keyword', require('./routes/zhilian/index'));

// 电鸭社区
router.get('/eleduck/jobs', require('./routes/eleduck/jobs'));

// 北华航天工业学院 - 新闻
router.get('/nciae/news', require('./routes/universities/nciae/news'));

// 北华航天工业学院 - 通知公告
router.get('/nciae/tzgg', require('./routes/universities/nciae/tzgg'));

// 北华航天工业学院 - 学术信息
router.get('/nciae/xsxx', require('./routes/universities/nciae/xsxx'));

// cfan
router.get('/cfan/news', require('./routes/cfan/news'));

// 搜狐 - 搜狐号
router.get('/sohu/mp/:id', require('./routes/sohu/mp'));

// 腾讯企鹅号
router.get('/tencent/news/author/:mid', require('./routes/tencent/news/author'));

// 奈菲影视
router.get('/nfmovies/:id?', require('./routes/nfmovies/index'));

// 书友社区
router.get('/andyt/:view?', require('./routes/andyt/index'));

// 品途商业评论
router.get('/pintu360/:type?', require('./routes/pintu360/index'));

// engadget中国版
router.get('/engadget-cn', require('./routes/engadget/home'));

// engadget
router.get('/engadget/:lang', require('./routes/engadget/home'));

// 吹牛部落
router.get('/chuiniu/column/:id', require('./routes/chuiniu/column'));

// leemeng
router.get('/leemeng', require('./routes/blogs/leemeng'));

// 中国地质大学
router.get('/cug/graduate', require('./routes/cug/graduate'));

// 网易 - 网易号
router.get('/netease/dy/:id', require('./routes/netease/dy'));

// 海猫吧
router.get('/haimaoba/:id?', require('./routes/haimaoba/comics'));

// 蒲公英
router.get('/pgyer/:app?', require('./routes/pgyer/app'));

// 微博个人时间线
router.get('/weibo/timeline/:uid/:feature?', require('./routes/weibo/timeline'));

// TAPTAP
router.get('/taptap/topic/:id/:label?', require('./routes/taptap/topic'));
router.get('/taptap/changelog/:id', require('./routes/taptap/changelog'));
router.get('/taptap/review/:id/:order?', require('./routes/taptap/review'));

// lofter
router.get('/lofter/tag/:name/:type?', require('./routes/lofter/tag'));

// 米坛社区表盘
router.get('/watchface/:watch_type?/:list_type?', require('./routes/watchface/update'));

// CNU视觉联盟
router.get('/cnu/selected', require('./routes/cnu/selected'));
router.get('/cnu/discovery/:type?/:category?', require('./routes/cnu/discovery'));

// 战旗直播
router.get('/zhanqi/room/:id', require('./routes/zhanqi/room'));

// 酒云网
router.get('/wineyun/:category', require('./routes/wineyun'));

// 重磅原创-每经网
router.get('/nbd/daily', require('./routes/nbd/article'));

// 快知
router.get('/kzfeed/topic/:id', require('./routes/kzfeed/topic'));

// 腾讯新闻较真查证平台
router.get('/factcheck', require('./routes/tencent/factcheck'));

// X-MOL化学资讯平台
router.get('/x-mol/news/:tag?', require('./routes/journals/x-mol/news.js'));
router.get('/x-mol/paper/:type/:magazine', require('./routes/journals/x-mol/paper'));

// 知识分子
router.get('/zhishifenzi/news/:type?', require('./routes/zhishifenzi/news'));
router.get('/zhishifenzi/depth', require('./routes/zhishifenzi/depth'));
router.get('/zhishifenzi/innovation/:type?', require('./routes/zhishifenzi/innovation'));

// 電撃Online
router.get('/dengekionline/:type?', require('./routes/dengekionline/new'));

// 4Gamers
router.get('/4gamers/category/:category', require('./routes/4gamers/category'));
router.get('/4gamers/tag/:tag', require('./routes/4gamers/tag'));

// 大麦网
router.get('/damai/activity/:city/:category/:subcategory/:keyword?', require('./routes/damai/activity'));

// 桂林电子科技大学新闻资讯
router.get('/guet/xwzx/:type?', require('./routes/guet/news'));

// はてな匿名ダイアリー
router.get('/hatena/anonymous_diary/archive', require('./routes/hatena/anonymous_diary/archive'));

// kaggle
router.get('/kaggle/discussion/:forumId/:sort?', require('./routes/kaggle/discussion'));
router.get('/kaggle/competitions/:category?', require('./routes/kaggle/competitions'));

// PubMed Trending
router.get('/pubmed/trending', require('./routes/journals/pubmed/trending'));

// 领科 (linkresearcher.com)
router.get('/linkresearcher/:params', require('./routes/linkresearcher/index'));

// eLife [Sci Journal]
router.get('/elife/:tid', require('./routes/journals/elife/index'));

// PNAS [Sci Journal]
router.get('/pnas/:tid', require('./routes/journals/pnas/index'));

// cell [Sci Journal]
router.get('/cell/cell/:category', require('./routes/journals/cell/cell/index'));

// nature + nature 子刊 [Sci Journal]
router.get('/nature/research/:journal?', require('./routes/journals/nature/research'));
router.get('/nature/news-and-comment/:journal?', require('./routes/journals/nature/news-and-comment'));
router.get('/nature/news', require('./routes/journals/nature/news'));
router.get('/nature/highlight', require('./routes/journals/nature/highlight'));

// science [Sci Journal]
router.get('/sciencemag/current/:journal?', require('./routes/journals/sciencemag/current'));
router.get('/sciencemag/early/science', require('./routes/journals/sciencemag/early'));

// dlsite
router.get('/dlsite/new/:type', require('./routes/dlsite/new'));
router.get('/dlsite/campaign/:type/:free?', require('./routes/dlsite/campaign'));

// mcbbs
router.get('/mcbbs/forum/:type', require('./routes/mcbbs/forum'));
router.get('/mcbbs/post/:tid/:authorid?', require('./routes/mcbbs/post'));

// Pocket
router.get('/pocket/trending', require('./routes/pocket/trending'));

// HK01
router.get('/hk01/zone/:id', require('./routes/hk01/zone'));
router.get('/hk01/channel/:id', require('./routes/hk01/channel'));
router.get('/hk01/issue/:id', require('./routes/hk01/issue'));
router.get('/hk01/tag/:id', require('./routes/hk01/tag'));
router.get('/hk01/hot', require('./routes/hk01/hot'));

// 码农周刊
router.get('/manong-weekly', require('./routes/manong-weekly/issues'));

// 每日猪价
router.get('/pork-price', require('./routes/pork-price'));

// NOI 全国青少年信息学奥林匹克竞赛
router.get('/noi', require('./routes/noi'));
router.get('/noi/winners-list', require('./routes/noi/winners-list'));
router.get('/noi/province-news', require('./routes/noi/province-news'));
router.get('/noi/rg-news', require('./routes/noi/rg-news'));

// 中国工业化和信息部
router.get('/gov/miit/zcwj', require('./routes/gov/miit/zcwj'));
router.get('/gov/miit/wjgs', require('./routes/gov/miit/wjgs'));
router.get('/gov/miit/zcjd', require('./routes/gov/miit/zcjd'));

// 中国国家认证认可监管管理员会
router.get('/gov/cnca/jgdt', require('./routes/gov/cnca/jgdt'));
router.get('/gov/cnca/hydt', require('./routes/gov/cnca/hydt'));

router.get('/gov/cnca/zxtz', require('./routes/gov/cnca/zxtz'));

// clickme
router.get('/clickme/:site/:grouping/:name', require('./routes/clickme'));

// 文汇报
router.get('/whb/:category', require('./routes/whb/zhuzhan'));

// 三界异次元
router.get('/3ycy/home', require('./routes/3ycy/home.js'));

// Emi Nitta official website
router.get('/emi-nitta/:type', require('./routes/emi-nitta/home'));

// Alter China
router.get('/alter-cn/news', require('./routes/alter-cn/news'));

// Visual Studio Code Marketplace
router.get('/vscode/marketplace/:type?', require('./routes/vscode/marketplace'));

// 饭否
router.get('/fanfou/user_timeline/:uid', require('./routes/fanfou/user_timeline'));
router.get('/fanfou/home_timeline', require('./routes/fanfou/home_timeline'));
router.get('/fanfou/favorites/:uid', require('./routes/fanfou/favorites'));
router.get('/fanfou/trends', require('./routes/fanfou/trends'));
router.get('/fanfou/public_timeline/:keyword', require('./routes/fanfou/public_timeline'));

// ITSlide
router.get('/itslide/new', require('./routes/itslide/new'));

// Remote Work
router.get('/remote-work/:caty?', require('./routes/remote-work/index'));

// China Times
router.get('/chinatimes/:caty', require('./routes/chinatimes/index'));

// TransferWise
router.get('/transferwise/pair/:source/:target', require('./routes/transferwise/pair'));

// chocolatey
router.get('/chocolatey/software/:name?', require('./routes/chocolatey/software'));

// Nyaa
router.get('/nyaa/search/:query?', require('./routes/nyaa/search'));

// 片源网
router.get('/pianyuan/:media?', require('./routes/pianyuan/app'));

// IT home
router.get('/ithome/:caty', require('./routes/ithome/index'));

// 巴哈姆特
router.get('/bahamut/creation/:author/:category?', require('./routes/bahamut/creation'));
router.get('/bahamut/creation_index/:category?/:subcategory?/:type?', require('./routes/bahamut/creation_index'));

// CentBrowser
router.get('/centbrowser/history', require('./routes/centbrowser/history'));

// 755
router.get('/755/user/:username', require('./routes/755/user'));

// IKEA
router.get('/ikea/uk/new', require('./routes/ikea/uk/new'));
router.get('/ikea/uk/offer', require('./routes/ikea/uk/offer'));

// Mastodon
router.get('/mastodon/timeline/:site/:only_media?', require('./routes/mastodon/timeline'));

// Kernel Aliyun
router.get('/aliyun-kernel/index', require('./routes/aliyun-kernel/index'));

// Vulture
router.get('/vulture/:type', require('./routes/vulture/index'));

// xinwenlianbo
router.get('/xinwenlianbo/index', require('./routes/xinwenlianbo/index'));

// Paul Graham - Essays
router.get('/blogs/paulgraham', require('./routes/blogs/paulgraham'));

// invisionapp
router.get('/invisionapp/inside-design', require('./routes/invisionapp/inside-design'));

// producthunt
router.get('/producthunt/today', require('./routes/producthunt/today'));

// mlog.club
router.get('/mlog-club/topics/:node', require('./routes/mlog-club/topics'));
router.get('/mlog-club/projects', require('./routes/mlog-club/projects'));

// Chrome 网上应用店
router.get('/chrome/webstore/extensions/:id', require('./routes/chrome/extensions'));

// RTHK
router.get('/rthk-news/:lang/:category', require('./routes/rthk-news/index'));

// yahoo
router.get('/yahoo-news/:region/:category?', require('./routes/yahoo-news/index'));

// Yahoo!テレビ
router.get('/yahoo-jp-tv/:query', require('./routes/yahoo-jp-tv/index'));

// 白鲸出海
router.get('/baijing', require('./routes/baijing'));

// 低端影视
router.get('/ddrk/update/:name/:season?', require('./routes/ddrk/index'));
router.get('/ddrk/tag/:tag', require('./routes/ddrk/list'));
router.get('/ddrk/category/:category', require('./routes/ddrk/list'));
router.get('/ddrk/index', require('./routes/ddrk/list'));

// 公主链接公告
router.get('/pcr/news', require('./routes/pcr/news'));
router.get('/pcr/news-tw', require('./routes/pcr/news-tw'));

// project-zero issues
router.get('/project-zero-issues', require('./routes/project-zero-issues/index'));

// 平安银河实验室
router.get('/galaxylab', require('./routes/galaxylab/index'));

// NOSEC 安全讯息平台
router.get('/nosec/:keykind?', require('./routes/nosec/index'));

// Hex-Rays News
router.get('/hex-rays/news', require('./routes/hex-rays/index'));

// 新趣集
router.get('/xinquji/today', require('./routes/xinquji/today'));
router.get('/xinquji/today/internal', require('./routes/xinquji/internal'));

// 英中协会
router.get('/gbcc/trust', require('./routes/gbcc/trust'));

// Associated Press
router.get('/apnews/topics/:topic', require('./routes/apnews/topics'));

// discuz
router.get('/discuz/:ver([7|x])/:cid([0-9]{2})/:link(.*)', require('./routes/discuz/discuz'));
router.get('/discuz/:ver([7|x])/:link(.*)', require('./routes/discuz/discuz'));
router.get('/discuz/:link(.*)', require('./routes/discuz/discuz'));

// China Dialogue 中外对话
router.get('/chinadialogue/topics/:topic', require('./routes/chinadialogue/topics'));
router.get('/chinadialogue/:column', require('./routes/chinadialogue/column'));

// Scala Blog
router.get('/scala/blog/:part?', require('./routes/scala-blog/scala-blog'));

// Minecraft Java版游戏更新
router.get('/minecraft/version', require('./routes/minecraft/version'));

// 微信更新日志
router.get('/weixin/miniprogram/release', require('./routes/tencent/wechat/miniprogram/release')); // 基础库更新

// 武汉肺炎疫情动态
router.get('/coronavirus/caixin', require('./routes/coronavirus/caixin'));
router.get('/coronavirus/dxy/data/:province?/:city?', require('./routes/coronavirus/dxy-data'));
router.get('/coronavirus/dxy', require('./routes/coronavirus/dxy'));
router.get('/coronavirus/scmp', require('./routes/coronavirus/scmp'));
router.get('/coronavirus/nhc', require('./routes/coronavirus/nhc'));
router.get('/coronavirus/mogov-2019ncov/:lang', require('./routes/coronavirus/mogov-2019ncov'));
router.get('/coronavirus/qq/fact', require('./routes/tencent/factcheck'));
router.get('/coronavirus/sg-moh', require('./routes/coronavirus/sg-moh'));

// 南京林业大学教务处
router.get('/njfu/jwc/:category?', require('./routes/universities/njfu/jwc'));

// 日本経済新聞
router.get('/nikkei/index', require('./routes/nikkei/index'));

// MQube
router.get('/mqube/user/:user', require('./routes/mqube/user'));
router.get('/mqube/tag/:tag', require('./routes/mqube/tag'));
router.get('/mqube/latest', require('./routes/mqube/latest'));
router.get('/mqube/top', require('./routes/mqube/top'));

// Letterboxd
router.get('/letterboxd/user/diary/:username', require('./routes/letterboxd/userdiary'));
router.get('/letterboxd/user/followingdiary/:username', require('./routes/letterboxd/followingdiary'));

// 网易大神
router.get('/netease/ds/:id', require('./routes/netease/ds'));

// javlibrary
router.get('/javlibrary/users/:uid/:utype', require('./routes/javlibrary/users'));
router.get('/javlibrary/videos/:vtype', require('./routes/javlibrary/videos'));
router.get('/javlibrary/stars/:sid', require('./routes/javlibrary/stars'));
router.get('/javlibrary/bestreviews', require('./routes/javlibrary/bestreviews'));

// Last.FM
router.get('/lastfm/recent/:user', require('./routes/lastfm/recent'));
router.get('/lastfm/loved/:user', require('./routes/lastfm/loved'));
router.get('/lastfm/top/:country?', require('./routes/lastfm/top'));

// piapro
router.get('/piapro/user/:pid', require('./routes/piapro/user'));
router.get('/piapro/public/:type/:tag?/:category?', require('./routes/piapro/public'));

// 凤凰网
router.get('/ifeng/feng/:id/:type', require('./routes/ifeng/feng'));

// 网易公开课
router.get('/open163/vip', require('./routes/netease/open/vip'));
router.get('/open163/latest', require('./routes/netease/open/latest'));

// 爱下电子书
router.get('/axdzs/:id1/:id2', require('./routes/novel/axdzs'));

// HackerOne
router.get('/hackerone/hacktivity', require('./routes/hackerone/hacktivity'));

// 奶牛关
router.get('/cowlevel/element/:id', require('./routes/cowlevel/element'));

// 2048
router.get('/2048/bbs/:fid', require('./routes/2048/bbs'));

// Google News
router.get('/google/news/:category/:locale', require('./routes/google/news'));

// 虛詞
router.get('/p-articles/section/:section', require('./routes/p-articles/section'));
router.get('/p-articles/contributors/:author', require('./routes/p-articles/contributors'));

// finviz

router.get('/finviz/news/:ticker', require('./routes/finviz/news'));

// 好好住
router.get('/haohaozhu/whole-house/:keyword?', require('./routes/haohaozhu/whole-house'));
router.get('/haohaozhu/discover/:keyword?', require('./routes/haohaozhu/discover'));

// 东北大学
router.get('/neu/news/:type', require('./routes/universities/neu/news'));

// 快递100
router.get('/kuaidi100/track/:number/:id/:phone?', require('./routes/kuaidi100/index'));
router.get('/kuaidi100/company', require('./routes/kuaidi100/supported_company'));

// 稻草人书屋
router.get('/dcrsw/:name/:count?', require('./routes/novel/dcrsw'));

// 魔法纪录
router.get('/magireco/announcements', require('./routes/magireco/announcements'));
router.get('/magireco/event_banner', require('./routes/magireco/event_banner'));

// wolley
router.get('/wolley', require('./routes/wolley/index'));
router.get('/wolley/user/:id', require('./routes/wolley/user'));
router.get('/wolley/host/:host', require('./routes/wolley/host'));

// 西安交大
router.get('/xjtu/dean/:subpath+', require('./routes/universities/xjtu/dean'));

// booksource
router.get('/booksource', require('./routes/booksource/index'));

// ku
router.get('/ku/:name?', require('./routes/ku/index'));

// 我有一片芝麻地
router.get('/blogs/hedwig/:type', require('./routes/blogs/hedwig'));

// LoveHeaven
router.get('/loveheaven/update/:slug', require('./routes/loveheaven/update'));

module.exports = router;
