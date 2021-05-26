const Router = require('@koa/router');
const config = require('@/config').value;
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

router.get('/robots.txt', async (ctx) => {
    if (config.disallowRobot) {
        ctx.set('Content-Type', 'text/plain');
        ctx.body = 'User-agent: *\nDisallow: /';
    } else {
        ctx.throw(404, 'Not Found');
    }
});

// test
router.get('/test/:id', require('./routes/test'));

// RSSHub
router.get('/rsshub/rss', require('./routes/rsshub/routes')); // 弃用
router.get('/rsshub/routes', require('./routes/rsshub/routes'));
router.get('/rsshub/sponsors', require('./routes/rsshub/sponsors'));

// 1draw
router.get('/1draw', require('./routes/1draw/index'));

// quicker
router.get('/quicker/qa', require('./routes/quicker/qa.js'));
router.get('/quicker/update', require('./routes/quicker/update.js'));
router.get('/quicker/user/action/:uid/:person', require('./routes/quicker/person.js'));
router.get('/quicker/user/:uid/:person', require('./routes/quicker/person.js'));

// Benedict Evans
router.get('/benedictevans', require('./routes/benedictevans/recent.js'));

// bilibili
router.get('/bilibili/user/video/:uid/:disableEmbed?', require('./routes/bilibili/video'));
router.get('/bilibili/user/article/:uid', require('./routes/bilibili/article'));
router.get('/bilibili/user/fav/:uid/:disableEmbed?', require('./routes/bilibili/userFav'));
router.get('/bilibili/user/coin/:uid/:disableEmbed?', require('./routes/bilibili/coin'));
router.get('/bilibili/user/dynamic/:uid/:disableEmbed?', require('./routes/bilibili/dynamic'));
router.get('/bilibili/user/followers/:uid', require('./routes/bilibili/followers'));
router.get('/bilibili/user/followings/:uid', require('./routes/bilibili/followings'));
router.get('/bilibili/user/bangumi/:uid/:type?', require('./routes/bilibili/user_bangumi'));
router.get('/bilibili/partion/:tid/:disableEmbed?', require('./routes/bilibili/partion'));
router.get('/bilibili/partion/ranking/:tid/:days?/:disableEmbed?', require('./routes/bilibili/partion-ranking'));
router.get('/bilibili/bangumi/:seasonid', require('./routes/bilibili/bangumi')); // 弃用
router.get('/bilibili/bangumi/media/:mediaid', require('./routes/bilibili/bangumi'));
router.get('/bilibili/video/page/:bvid/:disableEmbed?', require('./routes/bilibili/page'));
router.get('/bilibili/video/reply/:bvid', require('./routes/bilibili/reply'));
router.get('/bilibili/video/danmaku/:bvid/:pid?', require('./routes/bilibili/danmaku'));
router.get('/bilibili/link/news/:product', require('./routes/bilibili/linkNews'));
router.get('/bilibili/live/room/:roomID', require('./routes/bilibili/liveRoom'));
router.get('/bilibili/live/search/:key/:order', require('./routes/bilibili/liveSearch'));
router.get('/bilibili/live/area/:areaID/:order', require('./routes/bilibili/liveArea'));
router.get('/bilibili/fav/:uid/:fid/:disableEmbed?', require('./routes/bilibili/fav'));
router.get('/bilibili/blackboard', require('./routes/bilibili/blackboard'));
router.get('/bilibili/mall/new/:category?', require('./routes/bilibili/mallNew'));
router.get('/bilibili/mall/ip/:id', require('./routes/bilibili/mallIP'));
router.get('/bilibili/ranking/:rid?/:day?/:arc_type?/:disableEmbed?', require('./routes/bilibili/ranking'));
router.get('/bilibili/user/channel/:uid/:cid/:disableEmbed?', require('./routes/bilibili/userChannel'));
router.get('/bilibili/topic/:topic', require('./routes/bilibili/topic'));
router.get('/bilibili/audio/:id', require('./routes/bilibili/audio'));
router.get('/bilibili/vsearch/:kw/:order?/:disableEmbed?', require('./routes/bilibili/vsearch'));
router.get('/bilibili/followings/dynamic/:uid/:disableEmbed?', require('./routes/bilibili/followings_dynamic'));
router.get('/bilibili/followings/video/:uid/:disableEmbed?', require('./routes/bilibili/followings_video'));
router.get('/bilibili/followings/article/:uid', require('./routes/bilibili/followings_article'));
router.get('/bilibili/readlist/:listid', require('./routes/bilibili/readlist'));
router.get('/bilibili/weekly', require('./routes/bilibili/weekly_recommend'));
router.get('/bilibili/manga/update/:comicid', require('./routes/bilibili/manga_update'));
router.get('/bilibili/app/:id?', require('./routes/bilibili/app'));

// bangumi
router.get('/bangumi/calendar/today', require('./routes/bangumi/calendar/today'));
router.get('/bangumi/subject/:id/:type', require('./routes/bangumi/subject'));
router.get('/bangumi/person/:id', require('./routes/bangumi/person'));
router.get('/bangumi/topic/:id', require('./routes/bangumi/group/reply'));
router.get('/bangumi/group/:id', require('./routes/bangumi/group/topic'));
router.get('/bangumi/subject/:id', require('./routes/bangumi/subject'));
router.get('/bangumi/user/blog/:id', require('./routes/bangumi/user/blog'));

// 報導者
router.get('/twreporter/newest', require('./routes/twreporter/newest'));
router.get('/twreporter/photography', require('./routes/twreporter/photography'));
router.get('/twreporter/category/:cid', require('./routes/twreporter/category'));

// 微博
router.get('/weibo/user/:uid/:routeParams?', require('./routes/weibo/user'));
router.get('/weibo/keyword/:keyword/:routeParams?', require('./routes/weibo/keyword'));
router.get('/weibo/search/hot', require('./routes/weibo/search/hot'));
router.get('/weibo/super_index/:id/:routeParams?', require('./routes/weibo/super_index'));
router.get('/weibo/oasis/user/:userid', require('./routes/weibo/oasis/user'));

// 贴吧
router.get('/tieba/forum/:kw', require('./routes/tieba/forum'));
router.get('/tieba/forum/good/:kw/:cid?', require('./routes/tieba/forum'));
router.get('/tieba/post/:id', require('./routes/tieba/post'));
router.get('/tieba/post/lz/:id', require('./routes/tieba/post'));
router.get('/tieba/user/:uid', require('./routes/tieba/user'));

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
router.get('/juejin/pins/:type?', require('./routes/juejin/pins'));
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
router.get('/zhihu/posts/:usertype/:id', require('./routes/zhihu/posts'));
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
router.get('/zhihu/timeline', require('./routes/zhihu/timeline'));
router.get('/zhihu/hot/:category?', require('./routes/zhihu/hot'));

// 妹子图
router.get('/mzitu/home/:type?', require('./routes/mzitu/home'));
router.get('/mzitu/tags', require('./routes/mzitu/tags'));
router.get('/mzitu/category/:category', require('./routes/mzitu/category'));
router.get('/mzitu/post/:id', require('./routes/mzitu/post'));
router.get('/mzitu/tag/:tag', require('./routes/mzitu/tag'));

// pixiv
router.get('/pixiv/user/bookmarks/:id', require('./routes/pixiv/bookmarks'));
router.get('/pixiv/user/illustfollows', require('./routes/pixiv/illustfollow'));
router.get('/pixiv/user/:id', require('./routes/pixiv/user'));
router.get('/pixiv/ranking/:mode/:date?', require('./routes/pixiv/ranking'));
router.get('/pixiv/search/:keyword/:order?/:r18?', require('./routes/pixiv/search'));

// pixiv-fanbox
router.get('/fanbox/:user?', require('./routes/fanbox/main'));

// 豆瓣
router.get('/douban/movie/playing', require('./routes/douban/playing'));
router.get('/douban/movie/playing/:score', require('./routes/douban/playing'));
router.get('/douban/movie/playing/:score/:city', require('./routes/douban/playing'));
router.get('/douban/movie/later', require('./routes/douban/later'));
router.get('/douban/movie/ustop', require('./routes/douban/ustop'));
router.get('/douban/movie/weekly/:type?', require('./routes/douban/weekly_best'));
router.get('/douban/movie/classification/:sort?/:score?/:tags?', require('./routes/douban/classification.js'));
router.get('/douban/group/:groupid/:type?', require('./routes/douban/group'));
router.get('/douban/explore', require('./routes/douban/explore'));
router.get('/douban/music/latest/:area?', require('./routes/douban/latest_music'));
router.get('/douban/book/latest', require('./routes/douban/latest_book'));
router.get('/douban/event/hot/:locationId', require('./routes/douban/event/hot'));
router.get('/douban/commercialpress/latest', require('./routes/douban/commercialpress/latest'));
router.get('/douban/bookstore', require('./routes/douban/bookstore'));
router.get('/douban/book/rank/:type?', require('./routes/douban/book/rank'));
router.get('/douban/doulist/:id', require('./routes/douban/doulist'));
router.get('/douban/explore/column/:id', require('./routes/douban/explore_column'));
router.get('/douban/people/:userid/status/:routeParams?', require('./routes/douban/people/status.js'));
router.get('/douban/people/:userid/wish/:routeParams?', require('./routes/douban/people/wish.js'));
router.get('/douban/replies/:uid', require('./routes/douban/replies'));
router.get('/douban/replied/:uid', require('./routes/douban/replied'));
router.get('/douban/topic/:id/:sort?', require('./routes/douban/topic.js'));
router.get('/douban/channel/:id/:nav?', require('./routes/douban/channel/topic.js'));
router.get('/douban/channel/:id/subject/:nav', require('./routes/douban/channel/subject.js'));
router.get('/douban/celebrity/:id/:sort?', require('./routes/douban/celebrity.js'));

// 法律白話文運動
router.get('/plainlaw/archives', require('./routes/plainlaw/archives.js'));

// 煎蛋
router.get('/jandan/article', require('./routes/jandan/article'));
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
router.get('/twitter/user/:id/:routeParams?', require('./routes/twitter/user'));
router.get('/twitter/list/:id/:name/:routeParams?', require('./routes/twitter/list'));
router.get('/twitter/likes/:id/:routeParams?', require('./routes/twitter/likes'));
router.get('/twitter/followings/:id/:routeParams?', require('./routes/twitter/followings'));
router.get('/twitter/keyword/:keyword/:routeParams?', require('./routes/twitter/keyword'));
router.get('/twitter/trends/:woeid?', require('./routes/twitter/trends'));

// YouTube
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

// 浪Play(原kingkong)直播
router.get('/kingkong/room/:id', require('./routes/langlive/room'));
router.get('/langlive/room/:id', require('./routes/langlive/room'));

// SHOWROOM直播
router.get('/showroom/room/:id', require('./routes/showroom/room'));

// v2ex
router.get('/v2ex/topics/:type', require('./routes/v2ex/topics'));
router.get('/v2ex/post/:postid', require('./routes/v2ex/post'));
router.get('/v2ex/tab/:tabid', require('./routes/v2ex/tab'));

// Telegram
router.get('/telegram/channel/:username/:searchQuery?', require('./routes/telegram/channel'));
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
router.get('/github/contributors/:user/:repo/:order?/:anon?', require('./routes/github/contributors'));
router.get('/github/topics/:name/:qs?', require('./routes/github/topic'));

// f-droid
router.get('/fdroid/apprelease/:app', require('./routes/fdroid/apprelease'));

// konachan
router.get('/konachan/post/popular_recent', require('./routes/konachan/post_popular_recent'));
router.get('/konachan.com/post/popular_recent', require('./routes/konachan/post_popular_recent'));
router.get('/konachan.net/post/popular_recent', require('./routes/konachan/post_popular_recent'));
router.get('/konachan/post/popular_recent/:period', require('./routes/konachan/post_popular_recent'));
router.get('/konachan.com/post/popular_recent/:period', require('./routes/konachan/post_popular_recent'));
router.get('/konachan.net/post/popular_recent/:period', require('./routes/konachan/post_popular_recent'));

// PornHub
router.get('/pornhub/category/:caty', require('./routes/pornhub/category'));
router.get('/pornhub/search/:keyword', require('./routes/pornhub/search'));
router.get('/pornhub/:language?/category_url/:url?', require('./routes/pornhub/category_url'));
router.get('/pornhub/:language?/users/:username', require('./routes/pornhub/users'));
router.get('/pornhub/:language?/model/:username/:sort?', require('./routes/pornhub/model'));
router.get('/pornhub/:language?/pornstar/:username/:sort?', require('./routes/pornhub/pornstar'));

// Prestige
router.get('/prestige-av/series/:mid/:sort?', require('./routes/prestige-av/series'));

// yande.re
router.get('/yande.re/post/popular_recent', require('./routes/yande.re/post_popular_recent'));
router.get('/yande.re/post/popular_recent/:period', require('./routes/yande.re/post_popular_recent'));

// 纽约时报
router.get('/nytimes/morning_post', require('./routes/nytimes/morning_post'));
router.get('/nytimes/book/:category?', require('./routes/nytimes/book.js'));
router.get('/nytimes/:lang?', require('./routes/nytimes/index'));

// 3dm
router.get('/3dm/:name/:type', require('./routes/3dm/game'));
router.get('/3dm/news', require('./routes/3dm/news_center'));

// 旅法师营地
router.get('/lfsyd/:typecode', require('./routes/lfsyd/index'));
router.get('/lfsyd/tag/:tag', require('./routes/lfsyd/tag'));

// 喜马拉雅
router.get('/ximalaya/album/:id/:all?', require('./routes/ximalaya/album'));
router.get('/ximalaya/album/:id/:all/:shownote?', require('./routes/ximalaya/album'));

// EZTV
router.get('/eztv/torrents/:imdb_id', require('./routes/eztv/imdb'));

// 什么值得买
router.get('/smzdm/keyword/:keyword', require('./routes/smzdm/keyword'));
router.get('/smzdm/ranking/:rank_type/:rank_id/:hour', require('./routes/smzdm/ranking'));
router.get('/smzdm/haowen/:day?', require('./routes/smzdm/haowen'));
router.get('/smzdm/haowen/fenlei/:name/:sort?', require('./routes/smzdm/haowen_fenlei'));
router.get('/smzdm/article/:uid', require('./routes/smzdm/article'));
router.get('/smzdm/baoliao/:uid', require('./routes/smzdm/baoliao'));

// 新京报
router.get('/bjnews/:cat', require('./routes/bjnews/news'));
router.get('/bjnews/epaper/:cat', require('./routes/bjnews/epaper'));

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
router.get('/cctv/photo/jx', require('./routes/cctv/jx'));
router.get('/cctv-special/:id?', require('./routes/cctv/special'));

// 财新博客
router.get('/caixin/blog/:column', require('./routes/caixin/blog'));
// 财新
router.get('/caixin/:column/:category', require('./routes/caixin/category'));
// 财新首页
router.get('/caixin/article', require('./routes/caixin/article'));
// 财新一线
router.get('/caixin/yxnews', require('./routes/caixin/yxnews'));

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

// cpython
router.get('/cpython/:pre?', require('./routes/cpython'));

// 小米
router.get('/mi/golden', require('./routes/mi/golden'));
router.get('/mi/crowdfunding', require('./routes/mi/crowdfunding'));
router.get('/mi/youpin/crowdfunding', require('./routes/mi/youpin/crowdfunding'));
router.get('/mi/youpin/new/:sort?', require('./routes/mi/youpin/new'));
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

// Gwern Bran­wen
router.get('/gwern/:category', require('./routes/gwern/category'));

// LinkedKeeper
router.get('/linkedkeeper/:type/:id?', require('./routes/linkedkeeper/index'));

// 开源中国
router.get('/oschina/news/:category?', require('./routes/oschina/news'));
router.get('/oschina/user/:id', require('./routes/oschina/user'));
router.get('/oschina/u/:id', require('./routes/oschina/u'));
router.get('/oschina/topic/:topic', require('./routes/oschina/topic'));

// MIT Technology Review
router.get('/technologyreview', require('./routes/technologyreview/index'));
router.get('/technologyreview/:category_name', require('./routes/technologyreview/topic'));

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
router.get('/wechat/wjdn/:id', require('./routes/tencent/wechat/wjdn'));
router.get('/wechat/wxnmh/:id', require('./routes/tencent/wechat/wxnmh'));
router.get('/wechat/mp/homepage/:biz/:hid/:cid?', require('./routes/tencent/wechat/mp'));
router.get('/wechat/mp/msgalbum/:biz/:aid', require('./routes/tencent/wechat/msgalbum'));
router.get('/wechat/feeds/:id', require('./routes/tencent/wechat/feeds'));

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
router.get('/mafengwo/ziyouxing/:code', require('./routes/mafengwo/ziyouxing'));

// 中国地震局震情速递（与地震台网同步更新）
router.get('/earthquake/:region?', require('./routes/earthquake'));

// 中国地震台网
router.get('/earthquake/ceic/:type', require('./routes/earthquake/ceic'));

// 小说
router.get('/novel/biquge/:id', require('./routes/novel/biquge'));
router.get('/novel/biqugeinfo/:id/:limit?', require('./routes/novel/biqugeinfo'));
router.get('/novel/uukanshu/:uid', require('./routes/novel/uukanshu'));
router.get('/novel/wenxuemi/:id1/:id2', require('./routes/novel/wenxuemi'));
router.get('/novel/booksky/:id', require('./routes/novel/booksky'));
router.get('/novel/shuquge/:id', require('./routes/novel/shuquge'));
router.get('/novel/ptwxz/:id1/:id2', require('./routes/novel/ptwxz'));
router.get('/novel/zhaishuyuan/:id', require('./routes/novel/zhaishuyuan'));

// 中国气象网
router.get('/weatheralarm/:province?', require('./routes/weatheralarm'));

// Gitlab
router.get('/gitlab/explore/:type', require('./routes/gitlab/explore'));

// 忧郁的loli
router.get('/mygalgame', require('./routes/galgame/hhgal')); // 废弃
router.get('/mmgal', require('./routes/galgame/hhgal')); // 废弃
router.get('/hhgal', require('./routes/galgame/hhgal'));

// say花火
router.get('/sayhuahuo', require('./routes/galgame/sayhuahuo'));

// 终点分享
router.get('/zdfx', require('./routes/galgame/zdfx'));

// 北京林业大学
router.get('/bjfu/grs', require('./routes/universities/bjfu/grs'));
router.get('/bjfu/kjc', require('./routes/universities/bjfu/kjc'));
router.get('/bjfu/jwc/:type', require('./routes/universities/bjfu/jwc/index'));
router.get('/bjfu/news/:type', require('./routes/universities/bjfu/news/index'));

// 北京理工大学
router.get('/bit/jwc', require('./routes/universities/bit/jwc/jwc'));
router.get('/bit/cs', require('./routes/universities/bit/cs/cs'));

// 北京交通大学
router.get('/bjtu/gs/:type', require('./routes/universities/bjtu/gs'));

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

// 河海大学
router.get('/hhu/libNews', require('./routes/universities/hhu/libNews'));
// 河海大学常州校区
router.get('/hhu/libNewsc', require('./routes/universities/hhu/libNewsc'));

// 哈尔滨工业大学
router.get('/hit/jwc', require('./routes/universities/hit/jwc'));
router.get('/hit/today/:category', require('./routes/universities/hit/today'));

// 哈尔滨工业大学（深圳）
router.get('/hitsz/article/:category?', require('./routes/universities/hitsz/article'));

// 哈尔滨工业大学（威海）
router.get('/hitwh/today', require('./routes/universities/hitwh/today'));

// 上海科技大学
router.get('/shanghaitech/activity', require('./routes/universities/shanghaitech/activity'));
router.get('/shanghaitech/sist/activity', require('./routes/universities/shanghaitech/sist/activity'));

// 上海交通大学
router.get('/sjtu/seiee/academic', require('./routes/universities/sjtu/seiee/academic'));
router.get('/sjtu/seiee/bjwb/:type', require('./routes/universities/sjtu/seiee/bjwb'));
router.get('/sjtu/seiee/xsb/:type?', require('./routes/universities/sjtu/seiee/xsb'));

router.get('/sjtu/gs/tzgg/:type?', require('./routes/universities/sjtu/gs/tzgg'));
router.get('/sjtu/jwc/:type?', require('./routes/universities/sjtu/jwc'));
router.get('/sjtu/tongqu/:type?', require('./routes/universities/sjtu/tongqu/activity'));
router.get('/sjtu/yzb/zkxx/:type', require('./routes/universities/sjtu/yzb/zkxx'));

// 江南大学
router.get('/ju/jwc/:type?', require('./routes/universities/ju/jwc'));

// 洛阳理工学院
router.get('/lit/jwc', require('./routes/universities/lit/jwc'));
router.get('/lit/xwzx/:name?', require('./routes/universities/lit/xwzx'));
router.get('/lit/tw/:name?', require('./routes/universities/lit/tw'));

// 清华大学
router.get('/thu/career', require('./routes/universities/thu/career'));
router.get('/thu/:type', require('./routes/universities/thu/index'));

// 北京大学
router.get('/pku/eecs/:type?', require('./routes/universities/pku/eecs'));
router.get('/pku/rccp/mzyt', require('./routes/universities/pku/rccp/mzyt'));
router.get('/pku/cls/lecture', require('./routes/universities/pku/cls/lecture'));
router.get('/pku/bbs/hot', require('./routes/universities/pku/bbs/hot'));

// 上海海事大学
router.get('/shmtu/www/:type', require('./routes/universities/shmtu/www'));
router.get('/shmtu/jwc/:type', require('./routes/universities/shmtu/jwc'));

// 上海海洋大学
router.get('/shou/www/:type', require('./routes/universities/shou/www'));

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
router.get('/cas/mesalab/kb', require('./routes/universities/cas/mesalab/kb'));
router.get('/cas/iee/kydt', require('./routes/universities/cas/iee/kydt'));
router.get('/cas/cg/:caty?', require('./routes/universities/cas/cg/index'));

// 中国传媒大学
router.get('/cuc/yz', require('./routes/universities/cuc/yz'));

// 中国科学技术大学
router.get('/ustc/news/:type?', require('./routes/universities/ustc/index'));
router.get('/ustc/jwc/:type?', require('./routes/universities/ustc/jwc/index'));

// UTdallas ISSO
router.get('/utdallas/isso', require('./routes/universities/utdallas/isso'));

// 南京邮电大学
router.get('/njupt/jwc/:type?', require('./routes/universities/njupt/jwc'));

// 南昌航空大学
router.get('/nchu/jwc/:type?', require('./routes/universities/nchu/jwc'));

// 哈尔滨工程大学
router.get('/heu/ugs/news/:author?/:category?', require('./routes/universities/heu/ugs/news'));
router.get('/heu/yjsy/:type?', require('./routes/universities/heu/yjsy'));
router.get('/heu/gongxue/:type?', require('./routes/universities/heu/news'));
router.get('/heu/news/:type?', require('./routes/universities/heu/news'));
router.get('/heu/shuisheng/:type?', require('./routes/universities/heu/uae'));
router.get('/heu/uae/:type?', require('./routes/universities/heu/uae'));
router.get('/heu/job/:type?', require('./routes/universities/heu/job'));

// 重庆大学
router.get('/cqu/jwc/announcement', require('./routes/universities/cqu/jwc/announcement'));
router.get('/cqu/news/jzyg', require('./routes/universities/cqu/news/jzyg'));
router.get('/cqu/news/tz', require('./routes/universities/cqu/news/tz'));
router.get('/cqu/youth/:category', require('./routes/universities/cqu/youth/info'));
router.get('/cqu/sci/:category', require('./routes/universities/cqu/sci/info'));
router.get('/cqu/net/:category', require('./routes/universities/cqu/net/info'));

// 重庆文理学院
router.get('/cqwu/news/:type?', require('./routes/universities/cqwu/news'));

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

// 郑州轻工业大学
router.get('/zzuli/campus/:type', require('./routes/universities/zzuli/campus'));
router.get('/zzuli/yjsc/:type', require('./routes/universities/zzuli/yjsc'));

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
router.get('/njust/eo/:grade?/:type?', require('./routes/universities/njust/eo'));

// 四川旅游学院
router.get('/sctu/xgxy', require('./routes/universities/sctu/information-engineer-faculty/index'));
router.get('/sctu/xgxy/:id', require('./routes/universities/sctu/information-engineer-faculty/context'));
router.get('/sctu/jwc/:type?', require('./routes/universities/sctu/jwc/index'));
router.get('/sctu/jwc/:type/:id', require('./routes/universities/sctu/jwc/context'));

// 电子科技大学
router.get('/uestc/jwc/:type?', require('./routes/universities/uestc/jwc'));
router.get('/uestc/is/:type?', require('./routes/universities/uestc/is'));
router.get('/uestc/news/:type?', require('./routes/universities/uestc/news'));
router.get('/uestc/auto/:type?', require('./routes/universities/uestc/auto'));
router.get('/uestc/cs/:type?', require('./routes/universities/uestc/cs'));
router.get('/uestc/cqe/:type?', require('./routes/universities/uestc/cqe'));
router.get('/uestc/gr', require('./routes/universities/uestc/gr'));
router.get('/uestc/sice', require('./routes/universities/uestc/sice'));

// 云南大学
router.get('/ynu/grs/zytz', require('./routes/universities/ynu/grs/zytz'));
router.get('/ynu/grs/qttz/:category', require('./routes/universities/ynu/grs/qttz'));
router.get('/ynu/jwc/:category', require('./routes/universities/ynu/jwc/zytz'));
router.get('/ynu/home', require('./routes/universities/ynu/home/main'));

// 昆明理工大学
router.get('/kmust/jwc/:type?', require('./routes/universities/kmust/jwc'));
router.get('/kmust/job/careers/:type?', require('./routes/universities/kmust/job/careers'));
router.get('/kmust/job/jobfairs', require('./routes/universities/kmust/job/jobfairs'));

// 武汉大学
router.get('/whu/cs/:type', require('./routes/universities/whu/cs'));
router.get('/whu/news/:type?', require('./routes/universities/whu/news'));

// 华中科技大学
router.get('/hust/auto/notice/:type?', require('./routes/universities/hust/aia/notice'));
router.get('/hust/auto/news', require('./routes/universities/hust/aia/news'));
router.get('/hust/aia/news', require('./routes/universities/hust/aia/news'));
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

// 浙江工业大学
router.get('/zjut/:type', require('./routes/universities/zjut/index'));
router.get('/zjut/design/:type', require('./routes/universities/zjut/design'));

// 上海大学
router.get('/shu/:type?', require('./routes/universities/shu/index'));
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

// 太原师范学院
router.get('/tynu', require('./routes/universities/tynu/tynu'));

// 中北大学
router.get('/nuc/:type', require('./routes/universities/nuc/index'));

// 安徽农业大学
router.get('/ahau/cs_news/:type', require('./routes/universities/ahau/cs_news/index'));
router.get('/ahau/jwc/:type', require('./routes/universities/ahau/jwc/index'));
router.get('/ahau/main/:type', require('./routes/universities/ahau/main/index'));

// 安徽医科大学研究生学院
router.get('/ahmu/news', require('./routes/universities/ahmu/news'));

// 安徽工业大学
router.get('/ahut/news', require('./routes/universities/ahut/news'));
router.get('/ahut/jwc', require('./routes/universities/ahut/jwc'));
router.get('/ahut/cstzgg', require('./routes/universities/ahut/cstzgg'));

// 上海理工大学
router.get('/usst/jwc', require('./routes/universities/usst/jwc'));

// 临沂大学
router.get('/lyu/news/:type', require('./routes/universities/lyu/news/index'));

// 福州大学
router.get('/fzu/:type', require('./routes/universities/fzu/news'));

// ifanr
router.get('/ifanr/:channel?', require('./routes/ifanr/index'));

// 果壳网
router.get('/guokr/scientific', require('./routes/guokr/scientific'));
router.get('/guokr/:channel', require('./routes/guokr/calendar'));

// 联合早报
router.get('/zaobao/realtime/:section?', require('./routes/zaobao/realtime'));
router.get('/zaobao/znews/:section?', require('./routes/zaobao/znews'));
router.get('/zaobao/:type/:section', require('./routes/zaobao/index'));
router.get('/zaobao/interactive-graphics', require('./routes/zaobao/interactive'));

// Apple
router.get('/apple/exchange_repair/:country?', require('./routes/apple/exchange_repair'));

// IPSW.me
router.get('/ipsw/index/:ptype/:pname', require('./routes/ipsw/index'));

// Minecraft CurseForge
router.get('/curseforge/files/:project', require('./routes/curseforge/files'));

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
router.get('/thepaper/list/:id', require('./routes/thepaper/list'));

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

// 人人影视 (评测推荐)
router.get('/rrys/review', require('./routes/rrys/review'));

// 人人影视（每日更新）
router.get('/yyets/todayfilelist', require('./routes/yyets/todayfilelist'));

// 趣头条
router.get('/qutoutiao/category/:cid', require('./routes/qutoutiao/category'));

// NHK NEW WEB EASY
router.get('/nhk/news_web_easy', require('./routes/nhk/news_web_easy'));

// BBC
router.get('/bbc/:site?/:channel?', require('./routes/bbc/index'));

// Financial Times
router.get('/ft/myft/:key', require('./routes/ft/myft'));
router.get('/ft/:language/:channel?', require('./routes/ft/channel'));

// The Verge
router.get('/verge', require('./routes/verge/index'));

// 看雪
router.get('/pediy/topic/:category?/:type?', require('./routes/pediy/topic'));

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
router.get('/60s-science', require('./routes/60s-science/transcript'));

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
router.get('/baidu/daily', require('./routes/baidu/daily'));

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
router.get('/typora/changelog-dev/:os?', require('./routes/typora/changelog-dev'));

// TSSstatus
router.get('/tssstatus/:board/:build', require('./routes/tssstatus'));

// Anime1
router.get('/anime1/anime/:time/:name', require('./routes/anime1/anime'));
router.get('/anime1/search/:keyword', require('./routes/anime1/search'));

// Global UDN
router.get('/udn/global/:tid', require('./routes/udn/global'));

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

// MiniFlux
router.get('/miniflux/subscription/:parameters?', require('./routes/miniflux/get_feeds'));
router.get('/miniflux/:feeds/:parameters?', require('./routes/miniflux/get_entries'));

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
router.get('/zimuzu/top/:range/:type', require('./routes/zimuzu/top'));

// 字幕库
router.get('/zimuku/:type?', require('./routes/zimuku/index'));

// SubHD.tv
router.get('/subhd/newest', require('./routes/subhd/newest'));

// 虎嗅
router.get('/huxiu/tag/:id', require('./routes/huxiu/tag'));
router.get('/huxiu/search/:keyword', require('./routes/huxiu/search'));
router.get('/huxiu/author/:id', require('./routes/huxiu/author'));
router.get('/huxiu/article', require('./routes/huxiu/article'));
router.get('/huxiu/collection/:id', require('./routes/huxiu/collection'));

// Steam
router.get('/steam/search/:params', require('./routes/steam/search'));
router.get('/steam/news/:appid/:language?', require('./routes/steam/news'));

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
router.get('/tingdiantz/95598/:province/:city/:district?', require('./routes/tingdiantz/95598'));

// 36kr
router.get('/36kr/search/article/:keyword', require('./routes/36kr/search/article'));
router.get('/36kr/newsflashes', require('./routes/36kr/newsflashes'));
router.get('/36kr/news/:caty', require('./routes/36kr/news'));
router.get('/36kr/user/:uid', require('./routes/36kr/user'));
router.get('/36kr/motif/:mid', require('./routes/36kr/motif'));

// PMCAFF
router.get('/pmcaff/list/:typeid', require('./routes/pmcaff/list'));
router.get('/pmcaff/feed/:typeid', require('./routes/pmcaff/feed'));
router.get('/pmcaff/user/:userid', require('./routes/pmcaff/user'));

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
router.get('/wallstreetcn/live/:channel?', require('./routes/wallstreetcn/live'));

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
router.get('/gov/shuju/:caty/:item', require('./routes/gov/shuju'));
router.get('/gov/xinwen/tujie/:caty', require('./routes/gov/xinwen/tujie'));

// 苏州
router.get('/gov/suzhou/news/:uid', require('./routes/gov/suzhou/news'));
router.get('/gov/suzhou/doc', require('./routes/gov/suzhou/doc'));

// 江苏
router.get('/gov/jiangsu/eea/:type?', require('./routes/gov/jiangsu/eea'));

// 山西
router.get('/gov/shanxi/rst/:category', require('./routes/gov/shanxi/rst'));

// 湖南
router.get('/gov/hunan/notice/:type', require('./routes/gov/hunan/notice'));

// 中华人民共和国国家发展和改革委员会
router.get('/gov/ndrc/xwdt/:caty?', require('./routes/gov/ndrc/xwdt'));

// 中华人民共和国-海关总署
router.get('/gov/customs/list/:gchannel', require('./routes/gov/customs/list'));

// 中华人民共和国生态环境部
router.get('/gov/mee/gs', require('./routes/gov/mee/gs'));

// 中华人民共和国教育部
router.get('/gov/moe/:type', require('./routes/gov/moe/moe'));

// 中华人民共和国外交部
router.get('/gov/fmprc/fyrbt', require('./routes/gov/fmprc/fyrbt'));

// 中华人民共和国住房和城乡建设部
router.get('/gov/mohurd/policy', require('./routes/gov/mohurd/policy'));

// 国家新闻出版广电总局
router.get('/gov/sapprft/approval/:channel/:detail?', require('./routes/gov/sapprft/7026'));

// 国家新闻出版署
router.get('/gov/nppa/:channel', require('./routes/gov/nppa/channels'));
router.get('/gov/nppa/:channel/:content', require('./routes/gov/nppa/contents'));

// 北京卫生健康委员会
router.get('/gov/beijing/mhc/:caty', require('./routes/gov/beijing/mhc'));

// 北京考试院
router.get('/gov/beijing/bjeea/:type', require('./routes/gov/beijing/eea'));

// 广东省教育厅
router.get('/gov/guangdong/edu/:caty', require('./routes/gov/guangdong/edu'));

// 广东省教育考试院
router.get('/gov/guangdong/eea/:caty', require('./routes/gov/guangdong/eea'));

// 广东省深圳市
router.get('/gov/shenzhen/xxgk/zfxxgj/:caty', require('./routes/gov/shenzhen/xxgk/zfxxgj'));

// 日本国外務省記者会見
router.get('/go.jp/mofa', require('./routes/go.jp/mofa/main'));

// 小黑盒
router.get('/xiaoheihe/user/:id', require('./routes/xiaoheihe/user'));
router.get('/xiaoheihe/news', require('./routes/xiaoheihe/news'));
router.get('/xiaoheihe/discount/:platform?', require('./routes/xiaoheihe/discount'));

// 惠誉评级
router.get('/fitchratings/site/:type', require('./routes/fitchratings/site'));

// 移动支付
router.get('/mpaypass/news', require('./routes/mpaypass/news'));
router.get('/mpaypass/main/:type?', require('./routes/mpaypass/main'));

// 新浪科技探索
router.get('/sina/discovery/:type', require('./routes/sina/discovery'));

// 新浪科技滚动新闻
router.get('/sina/rollnews', require('./routes/sina/rollnews'));

// 新浪体育
router.get('/sina/sports/:type', require('./routes/sina/sports'));

// 新浪专栏创事记
router.get('/sina/csj', require('./routes/sina/chuangshiji'));

// 新浪财经－国內
router.get('/sina/finance', require('./routes/sina/finance'));

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
router.get('/woshipm/latest', require('./routes/woshipm/latest'));

// 高清电台
router.get('/gaoqing/latest', require('./routes/gaoqing/latest'));

// 轻小说文库
router.get('/wenku8/chapter/:id', require('./routes/wenku8/chapter'));

// 鲸跃汽车
router.get('/whalegogo/home', require('./routes/whalegogo/home'));
router.get('/whalegogo/portal/:type_id/:tagid?', require('./routes/whalegogo/portal'));

// 爱思想
router.get('/aisixiang/column/:id', require('./routes/aisixiang/column'));
router.get('/aisixiang/ranking/:type?/:range?', require('./routes/aisixiang/ranking'));
router.get('/aisixiang/thinktank/:name/:type?', require('./routes/aisixiang/thinktank'));

// Hacker News
router.get('/hackernews/:section/:type?', require('./routes/hackernews/story'));

// LeetCode
router.get('/leetcode/articles', require('./routes/leetcode/articles'));
router.get('/leetcode/submission/us/:user', require('./routes/leetcode/check-us'));
router.get('/leetcode/submission/cn/:user', require('./routes/leetcode/check-cn'));

// segmentfault
router.get('/segmentfault/channel/:name', require('./routes/segmentfault/channel'));
router.get('/segmentfault/user/:name', require('./routes/segmentfault/user'));

// 虎扑
router.get('/hupu/bxj/:id/:order?', require('./routes/hupu/bbs'));
router.get('/hupu/bbs/:id/:order?', require('./routes/hupu/bbs'));
router.get('/hupu/all/:caty', require('./routes/hupu/all'));
router.get('/hupu/dept/:dept', require('./routes/hupu/dept'));

// 牛客网
router.get('/nowcoder/discuss/:type/:order', require('./routes/nowcoder/discuss'));
router.get('/nowcoder/schedule/:propertyId?/:typeId?', require('./routes/nowcoder/schedule'));
router.get('/nowcoder/recommend', require('./routes/nowcoder/recommend'));
router.get('/nowcoder/jobcenter/:recruitType?/:city?/:type?/:order?/:latest?', require('./routes/nowcoder/jobcenter'));

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
router.get('/luogu/user/feed/:uid', require('./routes/luogu/userFeed'));

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

// WordPress
router.get('/blogs/wordpress/:domain/:https?', require('./routes/blogs/wordpress'));

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
router.get('/banyuetan/byt/:time?', require('./routes/banyuetan/byt'));
router.get('/banyuetan/:name', require('./routes/banyuetan'));

// 人民日报
router.get('/people/opinion/:id', require('./routes/people/opinion'));
router.get('/people/env/:id', require('./routes/people/env'));
router.get('/people/xjpjh/:keyword?/:year?', require('./routes/people/xjpjh'));
router.get('/people/cpc/24h', require('./routes/people/cpc/24h'));

// 北极星电力网
router.get('/bjx/huanbao', require('./routes/bjx/huanbao'));

// gamersky
router.get('/gamersky/news', require('./routes/gamersky/news'));
router.get('/gamersky/ent/:category', require('./routes/gamersky/ent'));

// 游研社
router.get('/yystv/category/:category', require('./routes/yystv/category'));
router.get('/yystv/docs', require('./routes/yystv/docs'));

// konami
router.get('/konami/pesmobile/:lang?/:os?', require('./routes/konami/pesmobile'));

// psnine
router.get('/psnine/index', require('./routes/psnine/index'));
router.get('/psnine/shuzhe', require('./routes/psnine/shuzhe'));
router.get('/psnine/trade', require('./routes/psnine/trade'));
router.get('/psnine/game', require('./routes/psnine/game'));
router.get('/psnine/news/:order?', require('./routes/psnine/news'));
router.get('/psnine/node/:id?/:order?', require('./routes/psnine/node'));

// 浙江大学
router.get('/zju/list/:type', require('./routes/universities/zju/list'));
router.get('/zju/physics/:type', require('./routes/universities/zju/physics'));
router.get('/zju/grs/:type', require('./routes/universities/zju/grs'));
router.get('/zju/career/:type', require('./routes/universities/zju/career'));
router.get('/zju/cst/:type', require('./routes/universities/zju/cst'));
router.get('/zju/cst/custom/:id', require('./routes/universities/zju/cst/custom'));

// 浙江大学城市学院
router.get('/zucc/news/latest', require('./routes/universities/zucc/news'));
router.get('/zucc/cssearch/latest/:webVpn/:key', require('./routes/universities/zucc/cssearch'));

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
router.get('/zaker/focusread', require('./routes/zaker/focusread'));

// Matters
router.get('/matters/topics', require('./routes/matters/topics'));
router.get('/matters/latest/:type?', require('./routes/matters/latest'));
router.redirect('/matters/hot', '/matters/latest/heat'); // Deprecated
router.get('/matters/tags/:tid', require('./routes/matters/tags'));
router.get('/matters/author/:uid', require('./routes/matters/author'));

// MobData
router.get('/mobdata/report', require('./routes/mobdata/report'));

// 谷雨
router.get('/tencent/guyu/channel/:name', require('./routes/tencent/guyu/channel'));

// 古诗文网
router.get('/gushiwen/recommend/:annotation?', require('./routes/gushiwen/recommend'));

// 电商在线
router.get('/imaijia/category/:category', require('./routes/imaijia/category'));

// 21财经
router.get('/21caijing/channel/:name', require('./routes/21caijing/channel'));

// 北京邮电大学
router.get('/bupt/yz/:type', require('./routes/universities/bupt/yz'));
router.get('/bupt/grs', require('./routes/universities/bupt/grs'));
router.get('/bupt/portal', require('./routes/universities/bupt/portal'));
router.get('/bupt/news', require('./routes/universities/bupt/news'));
router.get('/bupt/funbox', require('./routes/universities/bupt/funbox'));

// VOCUS 方格子
router.get('/vocus/publication/:id', require('./routes/vocus/publication'));
router.get('/vocus/user/:id', require('./routes/vocus/user'));

// 一亩三分地 1point3acres
router.get('/1point3acres/blog/:category?', require('./routes/1point3acres/blog'));
router.get('/1point3acres/user/:id/threads', require('./routes/1point3acres/threads'));
router.get('/1point3acres/user/:id/posts', require('./routes/1point3acres/posts'));
router.get('/1point3acres/offer/:year?/:major?/:school?', require('./routes/1point3acres/offer'));
router.get('/1point3acres/post/:category', require('./routes/1point3acres/post'));

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
router.get('/ps/:lang?/product/:gridName', require('./routes/ps/product'));

// Quanta Magazine
router.get('/quantamagazine/archive', require('./routes/quantamagazine/archive'));

// Nintendo
router.get('/nintendo/eshop/jp', require('./routes/nintendo/eshop_jp'));
router.get('/nintendo/eshop/hk', require('./routes/nintendo/eshop_hk'));
router.get('/nintendo/eshop/us', require('./routes/nintendo/eshop_us'));
router.get('/nintendo/eshop/cn', require('./routes/nintendo/eshop_cn'));
router.get('/nintendo/news', require('./routes/nintendo/news'));
router.get('/nintendo/news/china', require('./routes/nintendo/news_china'));
router.get('/nintendo/direct', require('./routes/nintendo/direct'));
router.get('/nintendo/system-update', require('./routes/nintendo/system-update'));

// 世界卫生组织
router.get('/who/news-room/:type', require('./routes/who/news-room'));

// 福利资源-met.red
router.get('/metred/fuli', require('./routes/metred/fuli'));

// MIT
router.get('/mit/graduateadmissions/:type/:name', require('./routes/universities/mit/graduateadmissions'));
router.get('/mit/ocw-top', require('./routes/universities/mit/ocw-top'));
router.get('/mit/csail/news', require('./routes/universities/mit/csail/news'));

// 毕马威
router.get('/kpmg/insights', require('./routes/kpmg/insights'));

// Saraba1st
router.get('/saraba1st/thread/:tid', require('./routes/saraba1st/thread'));

// gradcafe
router.get('/gradcafe/result/:type', require('./routes/gradcafe/result'));
router.get('/gradcafe/result', require('./routes/gradcafe/result'));

// The Economist
router.get('/the-economist/download', require('./routes/the-economist/download'));
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
router.get('/zfrontier/board/:boardId', require('./routes/zfrontier/board_postlist'));

// 观察者网
router.get('/guancha/headline', require('./routes/guancha/headline'));
router.get('/guancha/topic/:id/:order?', require('./routes/guancha/topic'));
router.get('/guancha/member/:caty?', require('./routes/guancha/member'));
router.get('/guancha/personalpage/:uid', require('./routes/guancha/personalpage'));
router.get('/guancha/:caty?', require('./routes/guancha/index'));

router.get('/guanchazhe/topic/:id/:order?', require('./routes/guancha/topic'));
router.get('/guanchazhe/personalpage/:uid', require('./routes/guancha/personalpage'));
router.get('/guanchazhe/index/:caty?', require('./routes/guancha/index'));

// Hpoi 手办维基
router.get('/hpoi/info/:type?', require('./routes/hpoi/info'));
router.get('/hpoi/:category/:words', require('./routes/hpoi'));
router.get('/hpoi/user/:user_id/:caty', require('./routes/hpoi/user'));

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

// 色花堂
router.get('/dsndsht23/picture/:subforumid', require('./routes/dsndsht23/index'));
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
router.get('/aqicn/:city/:pollution?', require('./routes/aqicn/index'));

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
router.get('/zhibo8/more/:caty', require('./routes/zhibo8/more'));

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
router.get('/aptonic/action/:untested?', require('./routes/aptonic/action'));

// 印记中文周刊
router.get('/docschina/jsweekly', require('./routes/docschina/jsweekly'));

// im2maker
router.get('/im2maker/:channel?', require('./routes/im2maker/index'));

// 巨潮资讯
router.get('/cninfo/announcement/:column/:code/:orgId/:category?/:search?', require('./routes/cninfo/announcement'));

// 金十数据
router.get('/jinshi/index', require('./routes/jinshi/index'));

// 中央纪委国家监委网站
router.get('/ccdi/scdc', require('./routes/ccdi/scdc'));

// 中华人民共和国农业农村部
router.get('/gov/moa/sjzxfb', require('./routes/gov/moa/sjzxfb'));
router.get('/gov/moa/:suburl(.*)', require('./routes/gov/moa/moa'));

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
router.get('/tencent/pvp/newsindex/:type', require('./routes/tencent/pvp/newsindex'));

// 《明日方舟》游戏
router.get('/arknights/news', require('./routes/arknights/news'));

// ff14
router.get('/ff14/ff14_zh/:type', require('./routes/ff14/ff14_zh'));
router.get('/ff14/ff14_global/:lang/:type', require('./routes/ff14/ff14_global'));

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
router.get('/zcool/top/:type', require('./routes/zcool/top'));
router.get('/zcool/top', require('./routes/zcool/top')); // 兼容老版本
router.get('/zcool/user/:uid', require('./routes/zcool/user'));
router.get('/zcool/discovery/:query?', require('./routes/zcool/discovery'));

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

// 坂道系列资讯
// 坂道系列官网新闻
router.get('/nogizaka46/news', require('./routes/nogizaka46/news'));
router.get('/keyakizaka46/news', require('./routes/keyakizaka46/news'));
router.get('/hinatazaka46/news', require('./routes/hinatazaka46/news'));
router.get('/keyakizaka46/blog', require('./routes/keyakizaka46/blog'));
router.get('/hinatazaka46/blog', require('./routes/hinatazaka46/blog'));
router.get('/sakurazaka46/blog', require('./routes/sakurazaka46/blog'));

// 酷安
router.get('/coolapk/tuwen/:type?', require('./routes/coolapk/tuwen'));
router.get('/coolapk/tuwen-xinxian', require('./routes/coolapk/tuwen'));
router.get('/coolapk/toutiao/:type?', require('./routes/coolapk/toutiao'));
router.get('/coolapk/huati/:tag', require('./routes/coolapk/huati'));
router.get('/coolapk/user/:uid/dynamic', require('./routes/coolapk/userDynamic'));
router.get('/coolapk/dyh/:dyhId', require('./routes/coolapk/dyh'));
router.get('/coolapk/hot/:type?/:period?', require('./routes/coolapk/hot'));

// 模型网
router.get('/moxingnet', require('./routes/moxingnet'));

// 湖北大学
router.get('/hubu/news/:type', require('./routes/universities/hubu/news'));

// 大连海事大学
router.get('/dlmu/news/:type', require('./routes/universities/dlmu/news'));
router.get('/dlmu/grs/zsgz/:type', require('./routes/universities/dlmu/grs/zsgz'));

// Rockstar Games Social Club
router.get('/socialclub/events/:game?', require('./routes/socialclub/events'));

// CTFHub Event Calendar
router.get('/ctfhub/upcoming/:limit?', require('./routes/ctfhub/upcoming'));
router.get('/ctfhub/search/:limit?/:form?/:class?/:title?', require('./routes/ctfhub/search'));

// 阿里云
router.get('/aliyun/database_month', require('./routes/aliyun/database_month'));
router.get('/aliyun/notice/:type?', require('./routes/aliyun/notice'));
router.get('/aliyun/developer/group/:type', require('./routes/aliyun/developer/group'));

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
router.get('/japanpost/:reqCode/:locale?', require('./routes/japanpost/index'));

// 中华人民共和国商务部
router.get('/mofcom/article/:suffix', require('./routes/mofcom/article'));

// 品玩
router.get('/pingwest/status', require('./routes/pingwest/status'));
router.get('/pingwest/tag/:tag/:type', require('./routes/pingwest/tag'));
router.get('/pingwest/user/:uid/:type?', require('./routes/pingwest/user'));

// Hanime
router.get('/hanime/video', require('./routes/hanime/video'));

// Soul
router.get('/soul/:id', require('./routes/soul'));
router.get('/soul/posts/hot', require('./routes/soul/hot'));

// 单向空间
router.get('/owspace/read/:type?', require('./routes/owspace/read'));

// 天涯论坛
router.get('/tianya/index/:type', require('./routes/tianya/index'));
router.get('/tianya/user/:userid', require('./routes/tianya/user'));
router.get('/tianya/comments/:userid', require('./routes/tianya/comments'));

// eleme
router.get('/eleme/open/announce', require('./routes/eleme/open/announce'));
router.get('/eleme/open-be/announce', require('./routes/eleme/open-be/announce'));

// 美团开放平台
router.get('/meituan/open/announce', require('./routes/meituan/open/announce'));

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

// MITRE
router.get('/mitre/publications', require('./routes/mitre/publications'));

// SANS
router.get('/sans/summit_archive', require('./routes/sans/summit_archive'));

// LaTeX 开源小屋
router.get('/latexstudio/home', require('./routes/latexstudio/home'));

// 上证债券信息网 - 可转换公司债券公告
router.get('/sse/convert/:query?', require('./routes/sse/convert'));
router.get('/sse/renewal', require('./routes/sse/renewal'));
router.get('/sse/inquire', require('./routes/sse/inquire'));

// 上海证券交易所
router.get('/sse/disclosure/:query?', require('./routes/sse/disclosure'));

// 深圳证券交易所
router.get('/szse/notice', require('./routes/szse/notice'));
router.get('/szse/inquire/:type', require('./routes/szse/inquire'));
router.get('/szse/rule', require('./routes/szse/rule'));

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
router.get('/engadget/:lang?', require('./routes/engadget/home'));

// 吹牛部落
router.get('/chuiniu/column/:id', require('./routes/chuiniu/column'));
router.get('/chuiniu/column_list', require('./routes/chuiniu/column_list'));

// leemeng
router.get('/leemeng', require('./routes/blogs/leemeng'));

// 中国地质大学（武汉）
router.get('/cug/graduate', require('./routes/universities/cug/graduate'));
router.get('/cug/undergraduate', require('./routes/universities/cug/undergraduate'));
router.get('/cug/xgxy', require('./routes/universities/cug/xgxy'));
router.get('/cug/news', require('./routes/universities/cug/news'));
router.get('/cug/gcxy/:type?', require('./routes/universities/cug/gcxy/index'));

// 海猫吧
router.get('/haimaoba/:id?', require('./routes/haimaoba/comics'));

// 路透社
router.get('/reuters/channel/:site/:channel', require('./routes/reuters/channel'));

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
router.get('/lofter/user/:username', require('./routes/lofter/posts'));

// 米坛社区表盘
router.get('/watchface/:watch_type?/:list_type?', require('./routes/watchface/update'));

// CNU视觉联盟
router.get('/cnu/selected', require('./routes/cnu/selected'));
router.get('/cnu/discovery/:type?/:category?', require('./routes/cnu/discovery'));

// 战旗直播
router.get('/zhanqi/room/:id', require('./routes/zhanqi/room'));

// 酒云网
router.get('/wineyun/:category', require('./routes/wineyun'));

// 小红书
router.get('/xiaohongshu/user/:user_id/:category', require('./routes/xiaohongshu/user'));
router.get('/xiaohongshu/board/:board_id', require('./routes/xiaohongshu/board'));

// 每经网
router.get('/nbd/daily', require('./routes/nbd/article'));
router.get('/nbd/:id?', require('./routes/nbd/index'));

// 快知
router.get('/kzfeed/topic/:id', require('./routes/kzfeed/topic'));

// 腾讯新闻较真查证平台
router.get('/factcheck', require('./routes/tencent/factcheck'));

// X-MOL化学资讯平台
router.get('/x-mol/news/:tag?', require('./routes/x-mol/news.js'));
router.get('/x-mol/paper/:type/:magazine', require('./routes/x-mol/paper'));

// 知识分子
router.get('/zhishifenzi/news/:type?', require('./routes/zhishifenzi/news'));
router.get('/zhishifenzi/depth', require('./routes/zhishifenzi/depth'));
router.get('/zhishifenzi/innovation/:type?', require('./routes/zhishifenzi/innovation'));

// 電撃Online
router.get('/dengekionline/:type?', require('./routes/dengekionline/new'));

// 4Gamers
router.get('/4gamers/category/:category', require('./routes/4gamers/category'));
router.get('/4gamers/tag/:tag', require('./routes/4gamers/tag'));
router.get('/4gamers/topic/:topic', require('./routes/4gamers/topic'));

// 大麦网
router.get('/damai/activity/:city/:category/:subcategory/:keyword?', require('./routes/damai/activity'));

// 桂林电子科技大学新闻资讯
router.get('/guet/xwzx/:type?', require('./routes/guet/news'));

// はてな匿名ダイアリー
router.get('/hatena/anonymous_diary/archive', require('./routes/hatena/anonymous_diary/archive'));

// kaggle
router.get('/kaggle/discussion/:forumId/:sort?', require('./routes/kaggle/discussion'));
router.get('/kaggle/competitions/:category?', require('./routes/kaggle/competitions'));
router.get('/kaggle/user/:user', require('./routes/kaggle/user'));

// PubMed Trending
router.get('/pubmed/trending', require('./routes/pubmed/trending'));

// 领科 (linkresearcher.com)
router.get('/linkresearcher/:params', require('./routes/linkresearcher/index'));

// eLife [Sci Journal]
router.get('/elife/:tid', require('./routes/elife/index'));

// IEEE Xplore [Sci Journal]
router.get('/ieee/author/:aid/:sortType/:count?', require('./routes/ieee/author'));

// PNAS [Sci Journal]
router.get('/pnas/:topic?', require('./routes/pnas/index'));

// cell [Sci Journal]
router.get('/cell/cell/:category', require('./routes/cell/cell/index'));
router.get('/cell/cover', require('./routes/cell/cover'));

// nature + nature 子刊 [Sci Journal]
router.get('/nature/research/:journal?', require('./routes/nature/research'));
router.get('/nature/news-and-comment/:journal?', require('./routes/nature/news-and-comment'));
router.get('/nature/cover', require('./routes/nature/cover'));
router.get('/nature/news', require('./routes/nature/news'));
router.get('/nature/highlight', require('./routes/nature/highlight'));

// science [Sci Journal]
router.get('/sciencemag/current/:journal?', require('./routes/sciencemag/current'));
router.get('/sciencemag/cover', require('./routes/sciencemag/cover'));
router.get('/sciencemag/early/science', require('./routes/sciencemag/early'));

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

// ITHome
router.get('/ithome/:caty', require('./routes/ithome/index'));
router.get('/ithome/ranking/:type', require('./routes/ithome/ranking'));

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
router.get('/mastodon/timeline/:site/:only_media?', require('./routes/mastodon/timeline_local'));
router.get('/mastodon/remote/:site/:only_media?', require('./routes/mastodon/timeline_remote'));
router.get('/mastodon/account_id/:site/:account_id/statuses/:only_media?', require('./routes/mastodon/account_id'));
router.get('/mastodon/acct/:acct/statuses/:only_media?', require('./routes/mastodon/acct'));

// Kernel Aliyun
router.get('/aliyun-kernel/index', require('./routes/aliyun-kernel/index'));

// Vulture
router.get('/vulture/:tag/:excludetags?', require('./routes/vulture/index'));

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

// Yahoo! by Author
router.get('/yahoo-author/:author', require('./routes/yahoo-author/index'));

// 白鲸出海
router.get('/baijing', require('./routes/baijing'));

// 低端影视
router.get('/ddrk/update/:name/:season?', require('./routes/ddrk/index'));
router.get('/ddrk/tag/:tag', require('./routes/ddrk/list'));
router.get('/ddrk/category/:category', require('./routes/ddrk/list'));
router.get('/ddrk/index', require('./routes/ddrk/list'));

// avgle
router.get('/avgle/videos/:order?/:time?/:top?', require('./routes/avgle/videos.js'));
router.get('/avgle/search/:keyword/:order?/:time?/:top?', require('./routes/avgle/videos.js'));

// 公主链接公告
router.get('/pcr/news', require('./routes/pcr/news'));
router.get('/pcr/news-tw', require('./routes/pcr/news-tw'));
router.get('/pcr/news-cn', require('./routes/pcr/news-cn'));

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

// CBC
router.get('/cbc/topics/:topic?', require('./routes/cbc/topics'));

// discuz
router.get('/discuz/:ver([7|x])/:cid([0-9]{2})/:link(.*)', require('./routes/discuz/discuz'));
router.get('/discuz/:ver([7|x])/:link(.*)', require('./routes/discuz/discuz'));
router.get('/discuz/:link(.*)', require('./routes/discuz/discuz'));

// China Dialogue 中外对话
router.get('/chinadialogue/topics/:topic', require('./routes/chinadialogue/topics'));
router.get('/chinadialogue/:column', require('./routes/chinadialogue/column'));

// 人民日报社 国际金融报
router.get('/ifnews/:cid', require('./routes/ifnews/column'));

// Scala Blog
router.get('/scala/blog/:part?', require('./routes/scala-blog/scala-blog'));

// Minecraft Java版游戏更新
router.get('/minecraft/version', require('./routes/minecraft/version'));

// 微信更新日志
router.get('/weixin/miniprogram/release', require('./routes/tencent/wechat/miniprogram/framework')); // 基础库更新日志
router.get('/weixin/miniprogram/framework', require('./routes/tencent/wechat/miniprogram/framework')); // 基础库更新日志
router.get('/weixin/miniprogram/devtools', require('./routes/tencent/wechat/miniprogram/devtools')); // 开发者工具更新日志
router.get('/weixin/miniprogram/wxcloud/:caty?', require('./routes/tencent/wechat/miniprogram/wxcloud')); // 云开发更新日志

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
router.get('/nikkei/:category/:article_type?', require('./routes/nikkei/news'));

// MQube
router.get('/mqube/user/:user', require('./routes/mqube/user'));
router.get('/mqube/tag/:tag', require('./routes/mqube/tag'));
router.get('/mqube/latest', require('./routes/mqube/latest'));
router.get('/mqube/top', require('./routes/mqube/top'));

// Letterboxd
router.get('/letterboxd/user/diary/:username', require('./routes/letterboxd/userdiary'));
router.get('/letterboxd/user/followingdiary/:username', require('./routes/letterboxd/followingdiary'));

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

// 第一版主
router.get('/novel/d1bz/:category/:id', require('./routes/d1bz/novel'));

// 爱下电子书
router.get('/axdzs/:id1/:id2', require('./routes/novel/axdzs'));

// HackerOne
router.get('/hackerone/hacktivity', require('./routes/hackerone/hacktivity'));
router.get('/hackerone/search/:search', require('./routes/hackerone/search'));

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
router.get('/xjtu/gs/tzgg', require('./routes/universities/xjtu/gs/tzgg'));
router.get('/xjtu/dean/:subpath+', require('./routes/universities/xjtu/dean'));
router.get('/xjtu/international/:subpath+', require('./routes/universities/xjtu/international'));

// booksource
router.get('/booksource', require('./routes/booksource/index'));

// ku
router.get('/ku/:name?', require('./routes/ku/index'));

// 我有一片芝麻地
router.get('/blogs/hedwig/:type', require('./routes/blogs/hedwig'));

// LoveHeaven
router.get('/loveheaven/update/:slug', require('./routes/loveheaven/update'));

// 拉勾
router.get('/lagou/jobs/:position/:city', require('./routes/lagou/jobs'));

// 扬州大学
router.get('/yzu/home/:type', require('./routes/universities/yzu/home'));
router.get('/yzu/yjszs/:type', require('./routes/universities/yzu/yjszs'));

// 国家自然科学基金委员会
router.get('/nsfc/news/:type?', require('./routes/nsfc/news'));

// 德国新闻社卫健新闻
router.get('/krankenkassen', require('./routes/krankenkassen'));

// 桂林航天工业学院
router.get('/guat/news/:type?', require('./routes/guat/news'));

// 国家留学网
router.get('/csc/notice/:type?', require('./routes/csc/notice'));

// LearnKu
router.get('/learnku/:community/:category?', require('./routes/learnku/topic'));

// NEEA
router.get('/neea/:type', require('./routes/neea'));

// 中国农业大学
router.get('/cauyjs', require('./routes/universities/cauyjs/cauyjs'));

// 南方科技大学
router.get('/sustyjs', require('./routes/universities/sustyjs/sustyjs'));
router.get('/sustech/newshub-zh', require('./routes/universities/sustech/newshub-zh'));
router.get('/sustech/bidding', require('./routes/universities/sustech/bidding'));

// 广州航海学院
router.get('/gzmtu/jwc', require('./routes/universities/gzmtu/jwc'));
router.get('/gzmtu/tsg', require('./routes/universities/gzmtu/tsg'));

// 广州大学
router.get('/gzyjs', require('./routes/universities/gzyjs/gzyjs'));

// 暨南大学
router.get('/jnu/xysx/:type', require('./routes/universities/jnu/xysx/index'));
router.get('/jnu/yw/:type?', require('./routes/universities/jnu/yw/index'));

// 深圳大学
router.get('/szuyjs', require('./routes/universities/szuyjs/szuyjs'));

// 中国传媒大学
router.get('/cucyjs', require('./routes/universities/cucyjs/cucyjs'));

// 中国农业大学信电学院
router.get('/cauele', require('./routes/universities/cauyjs/cauyjs'));

// moxingfans
router.get('/moxingfans', require('./routes/moxingfans'));

// Chiphell
router.get('/chiphell/forum/:forumId?', require('./routes/chiphell/forum'));

// 华东理工大学研究生院
router.get('/ecustyjs', require('./routes/universities/ecustyjs/ecustyjs'));

// 同济大学研究生院
router.get('/tjuyjs', require('./routes/universities/tjuyjs/tjuyjs'));

// 中国石油大学研究生院
router.get('/upcyjs', require('./routes/universities/upcyjs/upcyjs'));

// 中国海洋大学研究生院
router.get('/outyjs', require('./routes/universities/outyjs/outyjs'));

// 中科院人工智能所
router.get('/zkyai', require('./routes/universities/zkyai/zkyai'));

// 中科院自动化所
router.get('/zkyyjs', require('./routes/universities/zkyyjs/zkyyjs'));

// 中国海洋大学信电学院
router.get('/outele', require('./routes/universities/outele/outele'));

// 华东师范大学研究生院
router.get('/ecnuyjs', require('./routes/universities/ecnuyjs/ecnuyjs'));

// 考研帮调剂信息
router.get('/kaoyan', require('./routes/kaoyan/kaoyan'));

// 华中科技大学研究生院
router.get('/hustyjs', require('./routes/universities/hustyjs/hustyjs'));

// 华中师范大学研究生院
router.get('/ccnuyjs', require('./routes/universities/ccnu/ccnuyjs'));

// 华中师范大学计算机学院
router.get('/ccnucs', require('./routes/universities/ccnu/ccnucs'));

// 华中师范大学伍论贡学院
router.get('/ccnuwu', require('./routes/universities/ccnu/ccnuwu'));

// WEEX
router.get('/weexcn/news/:typeid', require('./routes/weexcn/index'));

// 天天基金
router.get('/eastmoney/user/:uid', require('./routes/eastmoney/user'));

// 紳士漫畫
router.get('/ssmh', require('./routes/ssmh'));
router.get('/ssmh/category/:cid', require('./routes/ssmh/category'));

// 武昌首义学院
router.get('/wsyu/news/:type?', require('./routes/universities/wsyu/news'));

// 华南师范大学研究生学院
router.get('/scnuyjs', require('./routes/universities/scnu/scnuyjs'));

// 华南师范大学软件学院
router.get('/scnucs', require('./routes/universities/scnu/scnucs'));

// 华南理工大学研究生院
router.get('/scutyjs', require('./routes/universities/scut/scutyjs'));

// 华南农业大学研究生院通知公告
router.get('/scauyjs', require('./routes/universities/scauyjs/scauyjs'));

// 北京大学研究生招生网通知公告
router.get('/pkuyjs', require('./routes/universities/pku/pkuyjs'));

// 北京理工大学研究生通知公告
router.get('/bityjs', require('./routes/universities/bit/bityjs'));

// 湖南科技大学教务处
router.get('/hnust/jwc', require('./routes/universities/hnust/jwc/index'));
router.get('/hnust/computer', require('./routes/universities/hnust/computer/index'));
router.get('/hnust/art', require('./routes/universities/hnust/art/index'));
router.get('/hnust/chem', require('./routes/universities/hnust/chem/index'));
router.get('/hnust/graduate/:type?', require('./routes/universities/hnust/graduate/index'));

// 西南交通大学
router.get('/swjtu/tl/news', require('./routes/swjtu/tl/news'));

// AGE动漫
router.get('/agefans/detail/:id', require('./routes/agefans/detail'));
router.get('/agefans/update', require('./routes/agefans/update'));

// Checkra1n
router.get('/checkra1n/releases', require('./routes/checkra1n/releases'));

// 四川省科学技术厅
router.get('/sckjt/news/:type?', require('./routes/sckjt/news'));

// 绝对领域
router.get('/jdlingyu/:type', require('./routes/jdlingyu/index'));

// Hi, DIYgod
router.get('/blogs/diygod/animal-crossing', require('./routes/blogs/diygod/animal-crossing'));
router.get('/blogs/diygod/gk', require('./routes/blogs/diygod/gk'));

// 湖北工业大学
router.get('/hbut/news/:type', require('./routes/universities/hbut/news'));
router.get('/hbut/cs/:type', require('./routes/universities/hbut/cs'));

// acwifi
router.get('/acwifi', require('./routes/acwifi'));

// a岛匿名版
router.get('/adnmb/:pid', require('./routes/adnmb/index'));

// MIT科技评论
router.get('/mittrchina/:type', require('./routes/mittrchina'));

// 消费者报道
router.get('/ccreports/article', require('./routes/ccreports'));

// iYouPort
router.get('/iyouport/article', require('./routes/iyouport'));
router.get('/iyouport/:category?', require('./routes/iyouport'));

// girlimg
router.get('/girlimg/album/:tag?/:mode?', require('./routes/girlimg/album'));

// etoland
router.get('/etoland/:bo_table', require('./routes/etoland/board'));

// 辽宁工程技术大学教务在线公告
router.get('/lntu/jwnews', require('./routes/universities/lntu/jwnews'));

// 51voa
router.get('/51voa/:channel', require('./routes/51voa/channel'));

// zhuixinfan
router.get('/zhuixinfan/list', require('./routes/zhuixinfan/list'));

// scoresaber
router.get('/scoresaber/user/:id', require('./routes/scoresaber/user'));

// blur-studio
router.get('/blur-studio', require('./routes/blur-studio/index'));

// method-studios
router.get('/method-studios/:menu?', require('./routes/method-studios/index'));

// blow-studio
router.get('/blow-studio', require('./routes/blow-studio/work'));

// axis-studios
router.get('/axis-studios/:type/:tag?', require('./routes/axis-studios/work'));

// 人民邮电出版社
router.get('/ptpress/book/:type?', require('./routes/ptpress/book'));

// uniqlo styling book
router.get('/uniqlo/stylingbook/:category?', require('./routes/uniqlo/stylingbook'));

// 本地宝焦点资讯
router.get('/bendibao/news/:city', require('./routes/bendibao/news'));

// unit-image
router.get('/unit-image/films/:type?', require('./routes/unit-image/films'));

// digic-picture
router.get('/digic-pictures/:menu/:tags?', require('./routes/digic-pictures/index'));

// cve.mitre.org
router.get('/cve/search/:keyword', require('./routes/cve/search'));

// Xposed Module Repository
router.get('/xposed/module/:mod', require('./routes/xposed/module'));

// Microsoft Edge
router.get('/edge/addon/:crxid', require('./routes/edge/addon'));

// Microsoft Store
router.get('/microsoft-store/updates/:productid/:market?', require('./routes/microsoft-store/updates'));

// 上海立信会计金融学院
router.get('/slu/tzgg/:id', require('./routes/universities/slu/tzgg'));
router.get('/slu/jwc/:id', require('./routes/universities/slu/jwc'));
router.get('/slu/tyyjkxy/:id', require('./routes/universities/slu/tyyjkxy'));
router.get('/slu/kjxy/:id', require('./routes/universities/slu/kjxy'));
router.get('/slu/xsc/:id', require('./routes/universities/slu/xsc'));
router.get('/slu/csggxy/:id', require('./routes/universities/slu/csggxy'));

// Ruby China
router.get('/ruby-china/topics/:type?', require('./routes/ruby-china/topics'));
router.get('/ruby-china/jobs', require('./routes/ruby-china/jobs'));

// 中国人事考试网
router.get('/cpta/notice', require('./routes/cpta/notice'));

// 广告网
router.get('/adquan/:type?', require('./routes/adquan/index'));

// 齐鲁晚报
router.get('/qlwb/news', require('./routes/qlwb/news'));
router.get('/qlwb/city/:city', require('./routes/qlwb/city'));

// 蜻蜓FM
router.get('/qingting/channel/:id', require('./routes/qingting/channel'));

// 金色财经
router.get('/jinse/lives', require('./routes/jinse/lives'));
router.get('/jinse/timeline', require('./routes/jinse/timeline'));
router.get('/jinse/catalogue/:caty', require('./routes/jinse/catalogue'));

// deeplearning.ai
router.get('/deeplearningai/thebatch', require('./routes/deeplearningai/thebatch'));

// Fate Grand Order
router.get('/fgo/news', require('./routes/fgo/news'));

// RF技术社区
router.get('/rf/article', require('./routes/rf/article'));

// University of Massachusetts Amherst
router.get('/umass/amherst/ecenews', require('./routes/umass/amherst/ecenews'));
router.get('/umass/amherst/eceseminar', require('./routes/umass/amherst/eceseminar'));
router.get('/umass/amherst/csnews', require('./routes/umass/amherst/csnews'));
router.get('/umass/amherst/ipoevents', require('./routes/umass/amherst/ipoevents'));
router.get('/umass/amherst/ipostories', require('./routes/umass/amherst/ipostories'));

// 飘花电影网
router.get('/piaohua/hot', require('./routes/piaohua/hot'));

// 快媒体
router.get('/kuai', require('./routes/kuai/index'));
router.get('/kuai/:id', require('./routes/kuai/id'));

// 生物帮
router.get('/biobio/:id', require('./routes/biobio/index'));
router.get('/biobio/:column/:id', require('./routes/biobio/others'));

// 199it
router.get('/199it', require('./routes/199it/index'));
router.get('/199it/category/:caty', require('./routes/199it/category'));
router.get('/199it/tag/:tag', require('./routes/199it/tag'));

// 唧唧堂
router.get('/jijitang/article/:id', require('./routes/jijitang/article'));
router.get('/jijitang/publication', require('./routes/jijitang/publication'));

// 新闻联播
router.get('/xwlb', require('./routes/xwlb/index'));

// 端传媒
router.get('/initium/:type?/:language?', require('./routes/initium/full'));
router.get('/theinitium/:model/:type?/:language?', require('./routes/initium/full'));

// Grub Street
router.get('/grubstreet', require('./routes/grubstreet/index'));

// 漫画堆
router.get('/manhuadui/manhua/:name/:serial?', require('./routes/manhuadui/manhua'));

// 风之漫画
router.get('/fzdm/manhua/:id/:nums?', require('./routes/fzdm/manhua'));

// Aljazeera 半岛网
router.get('/aljazeera/news', require('./routes/aljazeera/news'));

// CFD indices dividend adjustment
router.get('/cfd/gbp_div', require('./routes/cfd/gbp_div'));

// 中国人民银行
router.get('/pbc/goutongjiaoliu', require('./routes/pbc/goutongjiaoliu'));
router.get('/pbc/tradeAnnouncement', require('./routes/pbc/tradeAnnouncement'));

// Monotype
router.get('/monotype/article', require('./routes/monotype/article'));

// Stork
router.get('/stork/keyword/:trackID/:displayKey', require('./routes/stork/keyword'));

// 致美化
router.get('/zhutix/latest', require('./routes/zhutix/latest'));

// arXiv
router.get('/arxiv/:query', require('./routes/arxiv/query'));

// 生物谷
router.get('/shengwugu/:uid?', require('./routes/shengwugu/index'));

// 环球律师事务所文章
router.get('/law/hq', require('./routes/law/hq'));

// 海问律师事务所文章
router.get('/law/hw', require('./routes/law/hw'));

// 国枫律师事务所文章
router.get('/law/gf', require('./routes/law/gf'));

// 通商律师事务所文章
router.get('/law/ts', require('./routes/law/ts'));

// 锦天城律师事务所文章
router.get('/law/jtc', require('./routes/law/jtc'));

// 中伦律师事务所文章
router.get('/law/zl', require('./routes/law/zl'));

// 君合律师事务所文章
router.get('/law/jh', require('./routes/law/jh'));

// 德恒律师事务所文章
router.get('/law/dh', require('./routes/law/dh'));

// 金诚同达律师事务所文章
router.get('/law/jctd', require('./routes/law/jctd'));

// Mobilism
router.get('/mobilism/release', require('./routes/mobilism/release'));

// 三星盖乐世社区
router.get('/samsungmembers/latest', require('./routes/samsungmembers/latest'));

// 东莞教研网
router.get('/dgjyw/:type', require('./routes/dgjyw/index'));

// 中国信息通信研究院
router.get('/gov/caict/bps', require('./routes/gov/caict/bps'));
router.get('/gov/caict/qwsj', require('./routes/gov/caict/qwsj'));
router.get('/gov/caict/caictgd', require('./routes/gov/caict/caictgd'));

// 中证网
router.get('/cs/news/:caty', require('./routes/cs/news'));

// 财联社
router.get('/cls/depth/:category?', require('./routes/cls/depth'));
router.get('/cls/telegraph/:category?', require('./routes/cls/telegraph'));

// hentai-cosplays
router.get('/hentai-cosplays/:type?/:name?', require('./routes/hentai-cosplays/hentai-cosplays'));
router.get('/porn-images-xxx/:type?/:name?', require('./routes/hentai-cosplays/porn-images-xxx'));

// dcinside
router.get('/dcinside/board/:id', require('./routes/dcinside/board'));

// 企鹅电竞
router.get('/egameqq/room/:id', require('./routes/tencent/egame/room'));

// 国家税务总局
router.get('/gov/chinatax/latest', require('./routes/gov/chinatax/latest'));

// 荔枝FM
router.get('/lizhi/user/:id', require('./routes/lizhi/user'));

// 富途牛牛
router.get('/futunn/highlights', require('./routes/futunn/highlights'));

// 外接大脑
router.get('/waijiedanao/article/:caty', require('./routes/waijiedanao/article'));

// 即刻
router.get('/jike/topic/:id', require('./routes/jike/topic'));
router.get('/jike/topic/text/:id', require('./routes/jike/topicText'));
router.get('/jike/user/:id', require('./routes/jike/user'));

// 网易新闻
router.get('/netease/news/rank/:category?/:type?/:time?', require('./routes/netease/news/rank'));
router.get('/netease/news/special/:type?', require('./routes/netease/news/special'));

// 网易 - 网易号
router.get('/netease/dy/:id', require('./routes/netease/dy'));
router.get('/netease/dy2/:id', require('./routes/netease/dy2'));

// 网易大神
router.get('/netease/ds/:id', require('./routes/netease/ds'));

// 网易公开课
router.get('/open163/vip', require('./routes/netease/open/vip'));
router.get('/open163/latest', require('./routes/netease/open/latest'));

// Boston.com
router.get('/boston/:tag?', require('./routes/boston/index'));

// 中国邮政速递物流
router.get('/ems/news', require('./routes/ems/news'));

// 场库
router.get('/changku', require('./routes/changku/index'));
router.get('/changku/cate/:postid', require('./routes/changku/index'));

// SCMP
router.get('/scmp/:category_id', require('./routes/scmp/index'));

// 上海市生态环境局
router.get('/gov/shanghai/sthj', require('./routes/gov/shanghai/sthj'));

// 才符
router.get('/91ddcc/user/:user', require('./routes/91ddcc/user'));
router.get('/91ddcc/stage/:stage', require('./routes/91ddcc/stage'));

// BookwalkerTW热门新书
router.get('/bookwalkertw/news', require('./routes/bookwalkertw/news'));

// Chicago Tribune
router.get('/chicagotribune/:category/:subcategory?', require('./routes/chicagotribune/index'));

// Amazfit Watch Faces
router.get('/amazfitwatchfaces/fresh/:model/:type?/:lang?', require('./routes/amazfitwatchfaces/fresh'));
router.get('/amazfitwatchfaces/updated/:model/:type?/:lang?', require('./routes/amazfitwatchfaces/updated'));
router.get('/amazfitwatchfaces/top/:model/:type?/:time?/:sortBy?/:lang?', require('./routes/amazfitwatchfaces/top'));
router.get('/amazfitwatchfaces/search/:model/:keyword?/:sortBy?', require('./routes/amazfitwatchfaces/search'));

// 猫耳FM
router.get('/missevan/drama/latest', require('./routes/missevan/latest'));
router.get('/missevan/drama/:id', require('./routes/missevan/drama'));

// Go语言爱好者周刊
router.get('/go-weekly', require('./routes/go-weekly'));

// popiask提问箱
router.get('/popiask/:sharecode/:pagesize?', require('./routes/popiask/questions'));

// Tapechat提问箱
router.get('/tapechat/questionbox/:sharecode/:pagesize?', require('./routes/popiask/tapechat_questions'));

// AMD
router.get('/amd/graphicsdrivers/:id/:rid?', require('./routes/amd/graphicsdrivers'));

// 二柄APP
router.get('/erbingapp/news', require('./routes/erbingapp/news'));

// 电商报
router.get('/dsb/area/:area', require('./routes/dsb/area'));

// 靠谱新闻
router.get('/kaopunews/all', require('./routes/kaopunews/all'));

// Reuters
router.get('/reuters/theWire', require('./routes/reuters/theWire'));

// 格隆汇
router.get('/gelonghui/user/:id', require('./routes/gelonghui/user'));
router.get('/gelonghui/subject/:id', require('./routes/gelonghui/subject'));
router.get('/gelonghui/keyword/:keyword', require('./routes/gelonghui/keyword'));

// 光谷社区
router.get('/guanggoo/:category?', require('./routes/guanggoo/index'));

// 万维读者
router.get('/creaders/headline', require('./routes/creaders/headline'));

// 金山词霸
router.get('/iciba/:days?/:img_type?', require('./routes/iciba/index'));

// 重庆市两江新区信息公开网
router.get('/gov/chongqing/ljxq/dwgk', require('./routes/gov/chongqing/ljxq/dwgk'));
router.get('/gov/chongqing/ljxq/zwgk/:caty', require('./routes/gov/chongqing/ljxq/zwgk'));

// 国家突发事件预警信息发布网
router.get('/12379', require('./routes/12379/index'));

// 鸟哥笔记
router.get('/ngbj', require('./routes/niaogebiji/index'));
router.get('/ngbj/today', require('./routes/niaogebiji/today'));
router.get('/ngbj/cat/:cat', require('./routes/niaogebiji/cat'));

// 梅花网
router.get('/meihua/shots/:caty', require('./routes/meihua/shots'));
router.get('/meihua/article/:caty', require('./routes/meihua/article'));

// 看点快报
router.get('/kuaibao', require('./routes/kuaibao/index'));

// SocialBeta
router.get('/socialbeta/home', require('./routes/socialbeta/home'));
router.get('/socialbeta/hunt', require('./routes/socialbeta/hunt'));

// 东方我乐多丛志
router.get('/touhougarakuta/:language/:type', require('./routes/touhougarakuta'));

// 猎趣TV
router.get('/liequtv/room/:id', require('./routes/liequtv/room'));

// Behance
router.get('/behance/:user/:type?', require('./routes/behance/index'));

// furstar.jp
router.get('/furstar/characters/:lang?', require('./routes/furstar/index'));
router.get('/furstar/artists/:lang?', require('./routes/furstar/artists'));
router.get('/furstar/archive/:lang?', require('./routes/furstar/archive'));

// 北京物资学院
router.get('/bwu/news', require('./routes/universities/bwu/news'));

// Picuki
router.get('/picuki/profile/:id/:displayVideo?', require('./routes/picuki/profile'));

// 新榜
router.get('/newrank/wechat/:wxid', require('./routes/newrank/wechat'));
router.get('/newrank/douyin/:dyid', require('./routes/newrank/douyin'));

// 漫小肆
router.get('/manxiaosi/book/:id', require('./routes/manxiaosi/book'));

// 吉林大学校内通知
router.get('/jlu/oa', require('./routes/universities/jlu/oa'));

// 小宇宙
router.get('/xiaoyuzhou', require('./routes/xiaoyuzhou/pickup'));

// 合肥工业大学
router.get('/hfut/tzgg', require('./routes/universities/hfut/tzgg'));

// Darwin Awards
router.get('/darwinawards/all', require('./routes/darwinawards/articles'));

// 四川职业技术学院
router.get('/scvtc/xygg', require('./routes/universities/scvtc/xygg'));

// 华南理工大学土木与交通学院
router.get('/scut/scet/notice', require('./routes/universities/scut/scet/notice'));

// OneJAV
router.get('/onejav/:type/:key?', require('./routes/onejav/one'));

// 141jav
router.get('/141jav/:type/:key?', require('./routes/141jav/141jav'));

// 141ppv
router.get('/141ppv/:type/:key?', require('./routes/141ppv/141ppv'));

// CuriousCat
router.get('/curiouscat/user/:id', require('./routes/curiouscat/user'));

// Telecompaper
router.get('/telecompaper/news/:caty/:year?/:country?/:type?', require('./routes/telecompaper/news'));
router.get('/telecompaper/search/:keyword?/:company?/:sort?/:period?', require('./routes/telecompaper/search'));

// 水木社区
router.get('/newsmth/account/:id', require('./routes/newsmth/account'));
router.get('/newsmth/section/:section', require('./routes/newsmth/section'));

// Kotaku
router.get('/kotaku/story/:type', require('./routes/kotaku/story'));

// 梅斯医学
router.get('/medsci/recommend', require('./routes/medsci/recommend'));

// Wallpaperhub
router.get('/wallpaperhub', require('./routes/wallpaperhub/index'));

// 悟空问答
router.get('/wukong/user/:id/:type?', require('./routes/wukong/user'));

// 腾讯大数据
router.get('/tencent/bigdata', require('./routes/tencent/bigdata/index'));

// 搜韵网
router.get('/souyun/today', require('./routes/souyun/today'));

// 生物谷
router.get('/bioon/latest', require('./routes/bioon/latest'));

// soomal
router.get('/soomal/topics/:category/:language?', require('./routes/soomal/topics'));

// NASA
router.get('/nasa/apod', require('./routes/nasa/apod'));
router.get('/nasa/apod-ncku', require('./routes/nasa/apod-ncku'));
router.get('/nasa/apod-cn', require('./routes/nasa/apod-cn'));

// 爱Q生活网
router.get('/iqshw/latest', require('./routes/3k8/latest'));
router.get('/3k8/latest', require('./routes/3k8/latest'));

// JustRun
router.get('/justrun', require('./routes/justrun/index'));

// 上海电力大学
router.get('/shiep/:type', require('./routes/universities/shiep/index'));

// 福建新闻
router.get('/fjnews/:city/:limit', require('./routes/fjnews/fznews'));
router.get('/fjnews/jjnews', require('./routes/fjnews/jjnews'));

// 中山网新闻
router.get('/zsnews/index/:cateid', require('./routes/zsnews/index'));

// 孔夫子旧书网
router.get('/kongfz/people/:id', require('./routes/kongfz/people'));
router.get('/kongfz/shop/:id/:cat?', require('./routes/kongfz/shop'));

// XMind
router.get('/xmind/mindmap/:lang?', require('./routes/xmind/mindmap'));

// 小刀娱乐网
router.get('/x6d/:id?', require('./routes/x6d/index'));

// 思维导图社区
router.get('/edrawsoft/mindmap/:classId?/:order?/:sort?/:lang?/:price?/:search?', require('./routes/edrawsoft/mindmap'));

// 它惠网
router.get('/tahui/rptlist', require('./routes/tahui/rptlist'));

// Guiltfree
router.get('/guiltfree/onsale', require('./routes/guiltfree/onsale'));

// 消费明鉴
router.get('/mingjian', require('./routes/mingjian/index'));

// hentaimama
router.get('/hentaimama/videos', require('./routes/hentaimama/videos'));

// 无讼
router.get('/itslaw/judgements/:conditions', require('./routes/itslaw/judgements'));

// 文学城
router.get('/wenxuecity/blog/:id', require('./routes/wenxuecity/blog'));
router.get('/wenxuecity/bbs/:cat/:elite?', require('./routes/wenxuecity/bbs'));
router.get('/wenxuecity/hot/:cid', require('./routes/wenxuecity/hot'));
router.get('/wenxuecity/news', require('./routes/wenxuecity/news'));

// 不安全
router.get('/buaq', require('./routes/buaq/index'));

// 快出海
router.get('/kchuhai', require('./routes/kchuhai/index'));

// i春秋资讯
router.get('/ichunqiu', require('./routes/ichunqiu/index'));

// 冰山博客
router.get('/bsblog123', require('./routes/bsblog123/index'));

// 纳威安全导航
router.get('/navisec', require('./routes/navisec/index'));

// 安全师
router.get('/secshi', require('./routes/secshi/index'));

// 出海笔记
router.get('/chuhaibiji', require('./routes/chuhaibiji/index'));

// 建宁闲谈
router.get('/blogs/jianning', require('./routes/blogs/jianning'));

// 妖火网
router.get('/yaohuo/:type?', require('./routes/yaohuo/index'));

// 互动吧
router.get('/hudongba/:city/:id', require('./routes/hudongba/index'));

// 差评
router.get('/chaping/banner', require('./routes/chaping/banner'));
router.get('/chaping/news/:caty?', require('./routes/chaping/news'));

// 飞雪娱乐网
router.get('/feixuew/:id?', require('./routes/feixuew/index'));

// 1X
router.get('/1x/:type?/:caty?', require('./routes/1x/index'));

// 剑网3
router.get('/jx3/:caty?', require('./routes/jx3/news'));

// GQ
router.get('/gq/tw/:caty?/:subcaty?', require('./routes/gq/tw/index'));

// 泉州市跨境电子商务协会
router.get('/qzcea/:caty?', require('./routes/qzcea/index'));

// 福利年
router.get('/fulinian/:caty?', require('./routes/fulinian/index'));

// CGTN
router.get('/cgtn/top', require('./routes/cgtn/top'));
router.get('/cgtn/most/:type?/:time?', require('./routes/cgtn/most'));

router.get('/cgtn/pick', require('./routes/cgtn/pick'));

router.get('/cgtn/opinions', require('./routes/cgtn/opinions'));

// AppSales
router.get('/appsales/:caty?/:time?', require('./routes/appsales/index'));

// Academy of Management
router.get('/aom/journal/:id', require('./routes/aom/journal'));

// 巴哈姆特電玩資訊站
router.get('/gamer/hot/:bsn', require('./routes/gamer/hot'));

// iCity
router.get('/icity/:id', require('./routes/icity/index'));

// Anki
router.get('/anki/changes', require('./routes/anki/changes'));

// ABC News
router.get('/abc/:site?', require('./routes/abc/index.js'));

// 台湾中央通讯社
router.get('/cna/:id?', require('./routes/cna/index'));

// 华为心声社区
router.get('/huawei/xinsheng/:caty?/:order?/:keyword?', require('./routes/huawei/xinsheng/index'));

// 守望先锋
router.get('/ow/patch', require('./routes/ow/patch'));

// MM范
router.get('/95mm/tab/:tab?', require('./routes/95mm/tab'));
router.get('/95mm/tag/:tag', require('./routes/95mm/tag'));
router.get('/95mm/category/:category', require('./routes/95mm/category'));

// 中国工程科技知识中心
router.get('/cktest/app/:ctgroup?/:domain?', require('./routes/cktest/app'));
router.get('/cktest/policy', require('./routes/cktest/policy'));

// 妈咪帮
router.get('/mamibuy/:caty?/:age?/:sort?', require('./routes/mamibuy/index'));

// Mercari
router.get('/mercari/:type/:id', require('./routes/mercari/index'));

// notefolio
router.get('/notefolio/:caty?/:order?/:time?/:query?', require('./routes/notefolio/index'));

// JavDB
router.get('/javdb/home/:caty?/:sort?/:filter?', require('./routes/javdb/home'));
router.get('/javdb/search/:keyword?/:filter?', require('./routes/javdb/search'));
router.get('/javdb/tags/:query?/:caty?', require('./routes/javdb/tags'));
router.get('/javdb/actors/:id/:filter?', require('./routes/javdb/actors'));
router.get('/javdb/makers/:id/:filter?', require('./routes/javdb/makers'));
router.get('/javdb/series/:id/:filter?', require('./routes/javdb/series'));
router.get('/javdb/rankings/:caty?/:time?', require('./routes/javdb/rankings'));

// World Economic Forum
router.get('/weforum/report/:lang?/:year?/:platform?', require('./routes/weforum/report'));

// Nobel Prize
router.get('/nobelprize/:caty?', require('./routes/nobelprize/index'));

// 中華民國國防部
router.get('/gov/taiwan/mnd', require('./routes/gov/taiwan/mnd'));

// 読売新聞
router.get('/yomiuri/:category', require('./routes/yomiuri/news'));

// 巴哈姆特
// GNN新闻
router.get('/gamer/gnn/:category?', require('./routes/gamer/gnn_index'));

// 中国人大网
router.get('/npc/:caty', require('./routes/npc/index'));

// 高科技行业门户
router.get('/ofweek/news', require('./routes/ofweek/news'));

// eventernote
router.get('/eventernote/actors/:name/:id', require('./routes/eventernote/actors'));

// 八阕
router.get('/popyard/:caty?', require('./routes/popyard/index'));

// 原神
router.get('/yuanshen/:location?/:category?', require('./routes/yuanshen/index'));

// World Trade Organization
router.get('/wto/dispute-settlement/:year?', require('./routes/wto/dispute-settlement'));

// 4399论坛
router.get('/forum4399/:mtag', require('./routes/game4399/forum'));

// 国防科技大学
router.get('/nudt/yjszs/:id?', require('./routes/universities/nudt/yjszs'));

// 全现在
router.get('/allnow/column/:id', require('./routes/allnow/column'));
router.get('/allnow/tag/:id', require('./routes/allnow/tag'));
router.get('/allnow/user/:id', require('./routes/allnow/user'));
router.get('/allnow', require('./routes/allnow/index'));

// 证券时报网
router.get('/stcn/news/:id?', require('./routes/stcn/news'));
router.get('/stcn/data/:id?', require('./routes/stcn/data'));
router.get('/stcn/kuaixun/:id?', require('./routes/stcn/kuaixun'));

// dev.to
router.get('/dev.to/top/:period', require('./routes/dev.to/top'));

// GameRes 游资网
router.get('/gameres/hot', require('./routes/gameres/hot'));
router.get('/gameres/list/:id', require('./routes/gameres/list'));

// ManicTime
router.get('/manictime/releases', require('./routes/manictime/releases'));

// Deutsche Welle 德国之声
router.get('/dw/:lang?/:caty?', require('./routes/dw/index'));

// Amazon
router.get('/amazon/ku/:type?', require('./routes/amazon/ku'));

// Citavi 中文网站论坛
router.get('/citavi/:caty?', require('./routes/citavi/index'));

// Sesame
router.get('/sesame/release_notes', require('./routes/sesame/release_notes'));

// 佐川急便
router.get('/sagawa/:id', require('./routes/sagawa/index'));

// QNAP
router.get('/qnap/release-notes/:id', require('./routes/qnap/release-notes'));

// Liquipedia
router.get('/liquipedia/dota2/matches/:id', require('./routes/liquipedia/dota2_matches.js'));

// 哈尔滨市科技局
router.get('/gov/harbin/kjj', require('./routes/gov/harbin/kjj'));

// WSJ
router.get('/wsj/:lang/:category?', require('./routes/wsj/index'));

// China File
router.get('/chinafile/:category?', require('./routes/chinafile/index'));

// 科技島讀
router.get('/daodu/:caty?', require('./routes/daodu/index'));

// CNTV
router.get('/cntv/:column', require('./routes/cntv/cntv'));

// Grand-Challenge
router.get('/grandchallenge/user/:id', require('./routes/grandchallenge/user'));
router.get('/grandchallenge/challenges', require('./routes/grandchallenge/challenges'));

// 西北工业大学
router.get('/nwpu/:column', require('./routes/nwpu/index'));

// 美国联邦最高法院
router.get('/us/supremecourt/argument_audio/:year?', require('./routes/us/supremecourt/argument_audio'));

// 得到
router.get('/dedao/list/:caty?', require('./routes/dedao/list'));
router.get('/dedao/knowledge/:topic?/:type?', require('./routes/dedao/knowledge'));
router.get('/dedao/:caty?', require('./routes/dedao/index'));

// 未名新闻
router.get('/mitbbs/:caty?', require('./routes/mitbbs/index'));

// 8kcos
router.get('/8kcos/', require('./routes/8kcos/latest'));
router.get('/8kcos/cat/:cat*', require('./routes/8kcos/cat'));

// 贾真的电商108将
router.get('/jiazhen108', require('./routes/jiazhen108/index'));

// Instagram
router.get('/instagram/:category/:key', require('./routes/instagram/index'));

// 优设网
router.get('/uisdc/talk/:sort?', require('./routes/uisdc/talk'));
router.get('/uisdc/hangye/:caty?', require('./routes/uisdc/hangye'));
router.get('/uisdc/news', require('./routes/uisdc/news'));
router.get('/uisdc/zt/:title?', require('./routes/uisdc/zt'));
router.get('/uisdc/topic/:title?/:sort?', require('./routes/uisdc/topic'));

// 中国劳工观察
router.get('/chinalaborwatch/reports/:lang?/:industry?', require('./routes/chinalaborwatch/reports'));

// Phoronix
router.get('/phoronix/:page/:queryOrItem?', require('./routes/phoronix/index'));

// 美国中央情报局
router.get('/cia/foia-annual-report', require('./routes/us/cia/foia-annual-report'));

// Everything
router.get('/everything/changes', require('./routes/everything/changes'));

// 中国劳工通讯
router.get('/clb/commentary/:lang?', require('./routes/clb/commentary'));

// 国际教育研究所
router.get('/iie/blog', require('./routes/iie/blog'));

// McKinsey Greater China
router.get('/mckinsey/:category?', require('./routes/mckinsey/index'));

// 超理论坛
router.get('/chaoli/:channel?', require('./routes/chaoli/index'));

// Polar
router.get('/polar/blog', require('./routes/polar/blog'));

// XYplorer
router.get('/xyplorer/whatsnew', require('./routes/xyplorer/whatsnew'));

// RescueTime
router.get('/rescuetime/release-notes/:os?', require('./routes/rescuetime/release-notes'));

// Total Commander
router.get('/totalcommander/whatsnew', require('./routes/totalcommander/whatsnew'));

// Blizzard
router.get('/blizzard/news/:language?/:category?', require('./routes/blizzard/news'));

// DeepMind
router.get('/deepmind/blog/:category?', require('./routes/deepmind/blog'));

// 东西智库
router.get('/dx2025/:type?/:category?', require('./routes/dx2025/index'));

// DeepL
router.get('/deepl/blog/:lang?', require('./routes/deepl/blog'));

// OpenAI
router.get('/openai/blog/:tag?', require('./routes/openai/blog'));

// 小木虫
router.get('/muchong/journal/:type?', require('./routes/muchong/journal'));
router.get('/muchong/:id/:type?/:sort?', require('./routes/muchong/index'));

// 求是网
router.get('/qstheory/:category?', require('./routes/qstheory/index'));

// 生命时报
router.get('/lifetimes/:category?', require('./routes/lifetimes/index'));

// MakeUseOf
router.get('/makeuseof/:category?', require('./routes/makeuseof/index'));

// 瞬Matataki
// 热门作品
router.get('/matataki/posts/hot/:ipfsFlag?', require('./routes/matataki/site/posts/scoreranking'));
// 最新作品
router.get('/matataki/posts/latest/:ipfsFlag?', require('./routes/matataki/site/posts/timeranking'));
// 作者创作
router.get('/matataki/users/:authorId/posts/:ipfsFlag?', require('./routes/matataki/site/posts/author'));
// Fan票关联作品
router.get('/matataki/tokens/:id/posts/:filterCode/:ipfsFlag?', require('./routes/matataki/site/posts/token'));
// 标签关联作品
router.get('/matataki/tags/:tagId/:tagName/posts/:ipfsFlag?', require('./routes/matataki/site/posts/tag'));
// 收藏夹
router.get('/matataki/users/:userId/favorites/:favoriteListId/posts/:ipfsFlag?', require('./routes/matataki/site/posts/favorite'));

// SoBooks
router.get('/sobooks/tag/:id?', require('./routes/sobooks/tag'));
router.get('/sobooks/date/:date?', require('./routes/sobooks/date'));
router.get('/sobooks/:category?', require('./routes/sobooks/index'));

// Zhimap 知识导图社区
router.get('/zhimap/:categoryUuid?/:recommend?', require('./routes/zhimap/index'));

// Fantia
router.get('/fantia/search/:type?/:caty?/:peroid?/:order?/:rating?/:keyword?', require('./routes/fantia/search'));
router.get('/fantia/user/:id', require('./routes/fantia/user'));

// i-Cable
router.get('/icable/:category/:option?', require('./routes/icable/category'));

// ProcessOn
router.get('/processon/popular/:cate?/:sort?', require('./routes/processon/popular'));

// Mathpix
router.get('/mathpix/blog', require('./routes/mathpix/blog'));

// OneNote Gem Add-Ins
router.get('/onenotegem/release', require('./routes/onenotegem/release'));

// Mind42
router.get('/mind42/tag/:id', require('./routes/mind42/tag'));
router.get('/mind42/search/:keyword', require('./routes/mind42/search'));
router.get('/mind42/:caty?', require('./routes/mind42/index'));

// 幕布网
router.get('/mubu/explore/:tagId/:title?', require('./routes/mubu/explore'));

// Esquirehk
router.get('/esquirehk/tag/:id', require('./routes/esquirehk/tag'));

// 国家普通话测试 杭州市
router.get('/putonghua', require('./routes/putonghua/hangzhou'));

// 有道云笔记
router.get('/youdao/xueba', require('./routes/youdao/xueba'));
router.get('/youdao/latest', require('./routes/youdao/latest'));

// 印象识堂
router.get('/yinxiang/note', require('./routes/yinxiang/note'));
router.get('/yinxiang/tag/:id', require('./routes/yinxiang/tag'));
router.get('/yinxiang/card/:id', require('./routes/yinxiang/card'));
router.get('/yinxiang/personal/:id', require('./routes/yinxiang/personal'));
router.get('/yinxiang/category/:id', require('./routes/yinxiang/category'));

// 晚点LatePost
router.get('/latepost/:proma?', require('./routes/latepost/index'));

// 西瓜视频
router.get('/ixigua/user/video/:uid/:disableEmbed?', require('./routes/ixigua/userVideo'));

// 遠見 gvm.com.tw
router.get('/gvm/index/:category?', require('./routes/gvm/index'));

// 触乐
router.get('/chuapp/index/:category?', require('./routes/chuapp/index'));

// Deloitte
router.get('/deloitte/industries/:category?', require('./routes/deloitte/industries'));

// 特斯拉系统更新
router.get('/tesla', require('./routes/tesla/update'));

// 复旦大学继续教育学院
router.get('/fudan/cce', require('./routes/universities/fudan/cce'));

// LowEndTalk
router.get('/lowendtalk/discussion/:id?', require('./routes/lowendtalk/discussion'));

// 无产者评论
router.get('/proletar/:type?/:id?', require('./routes/proletar/index'));

// QTTabBar
router.get('/qttabbar/change-log', require('./routes/qttabbar/change-log'));

// 酷18
router.get('/cool18/:id?/:type?/:keyword?', require('./routes/cool18/index'));

// 美国贸易代表办公室
router.get('/ustr/press-releases/:year?/:month?', require('./routes/us/ustr/press-releases'));

// 游戏动力
router.get('/vgn/:platform?', require('./routes/vgn/index'));

// 国际能源署
router.get('/iea/:category?', require('./routes/iea/index'));

// 中国计算机学会
router.get('/ccf/news/:category?', require('./routes/ccf/news'));

// The Brain
router.get('/thebrain/:category?', require('./routes/thebrain/blog'));

// 美国财政部
router.get('/treasury/press-releases/:category?/:title?', require('./routes/us/treasury/press-releases'));

// Bandisoft
router.get('/bandisoft/:id?/:lang?', require('./routes/bandisoft/index'));

// MarginNote
router.get('/marginnote/tag/:id?', require('./routes/marginnote/tag'));

// ASML
router.get('/asml/press-releases', require('./routes/asml/press-releases'));

// 中国机械工程学会
router.get('/cmes/news/:category?', require('./routes/cmes/news'));

// Craigslist
router.get('/craigslist/:location/:type', require('./routes/craigslist/search'));

// 有趣天文奇观
router.get('/interesting-sky/astronomical_events/:year?', require('./routes/interesting-sky/astronomical_events'));
router.get('/interesting-sky/recent-interesting', require('./routes/interesting-sky/recent-interesting'));
router.get('/interesting-sky', require('./routes/interesting-sky/index'));

// 国际数学联合会
router.get('/mathunion/fields-medal', require('./routes/mathunion/fields-medal'));

// ACM
router.get('/acm/amturingaward', require('./routes/acm/amturingaward'));

// 網路天文館
router.get('/tam/forecast', require('./routes/tam/forecast'));

// Day One
router.get('/dayone/blog', require('./routes/dayone/blog'));

// 滴答清单
router.get('/dida365/habit/checkins', require('./routes/dida365/habit-checkins'));

// Ditto clipboard manager
router.get('/ditto/changes/:type?', require('./routes/ditto/changes'));

// iDaily 每日环球视野
router.get('/idaily/today', require('./routes/idaily/index'));

// 北屋
router.get('/northhouse/:category?', require('./routes/northhouse/index'));

// Oak Ridge National Laboratory
router.get('/ornl/news', require('./routes/ornl/news'));

// 信阳师范学院 自考办
router.get('/xynu/zkb/:category', require('./routes/universities/xynu/zkb'));

// Bell Labs
router.get('/bell-labs/events-news/:category?', require('./routes/bell-labs/events-news.js'));

// 中国科学院青年创新促进会
router.get('/yicas/blog', require('./routes/yicas/blog'));

// 九三学社
router.get('/93/:category?', require('./routes/93/index'));

// 科学网
router.get('/sciencenet/blog/:type?/:time?/:sort?', require('./routes/sciencenet/blog'));

// DailyArt
router.get('/dailyart/:language?', require('./routes/dailyart/index'));

// SCBOY
router.get('/scboy/thread/:tid', require('./routes/scboy/thread'));

// 猿料
router.get('/yuanliao/:tag?/:sort?', require('./routes/yuanliao/index'));

// 中国政协网
router.get('/cppcc/:slug?', require('./routes/gov/cppcc/index'));

// National Association of Colleges and Employers
router.get('/nace/blog/:sort?', require('./routes/nace/blog'));

// Caixin Latest
router.get('/caixin/latest', require('./routes/caixin/latest'));

// Semiconductor Industry Association
router.get('/semiconductors/latest-news', require('./routes/semiconductors/latest-news'));

// VOA News
router.get('/voa/day-photos', require('./routes/voa/day-photos'));

// Voice of America
router.get('/voa/:language/:channel?', require('./routes/voa/index'));

// 留园网
router.get('/6park/:id?/:type?/:keyword?', require('./routes/6park/index'));

// 哔嘀影视
router.get('/bde4/:type?/:caty?/:area?/:year?/:order?', require('./routes/bde4/index'));

// 上海证券交易所
router.get('/sse/sserules/:slug?', require('./routes/sse/sserules'));

// 游戏葡萄
router.get('/gamegrape/:id?', require('./routes/gamegrape/index'));

// 阳光高考
router.get('/chsi/zszcgd/:category?', require('./routes/chsi/zszcgd'));

// 眾新聞
router.get('/hkcnews/news/:category?', require('./routes/hkcnews/news'));

// AnyTXT
router.get('/anytxt/release-notes', require('./routes/anytxt/release-notes'));

// 鱼塘热榜
router.get('/mofish/:id', require('./routes/mofish/index'));

// Mcdonalds
router.get('/mcdonalds/:category', require('./routes/mcdonalds/news'));

// Pincong 品葱
router.get('/pincong/category/:category?/:sort?', require('./routes/pincong/index'));
router.get('/pincong/hot/:category?', require('./routes/pincong/hot'));
router.get('/pincong/topic/:topic', require('./routes/pincong/topic'));

// GoComics
router.get('/gocomics/:name', require('./routes/gocomics/index'));

// Comics Kingdom
router.get('/comicskingdom/:name', require('./routes/comicskingdom/index'));

// Media Digest
router.get('/mediadigest/:range/:category?', require('./routes/mediadigest/category'));

// 中国农工民主党
router.get('/ngd/:slug?', require('./routes/gov/ngd/index'));

// SimpRead-消息通知
router.get('/simpread/notice', require('./routes/simpread/notice'));
// SimpRead-更新日志
router.get('/simpread/changelog', require('./routes/simpread/changelog'));

// Radio Free Asia
router.get('/rfa/:language?/:channel?/:subChannel?', require('./routes/rfa/index'));

// booth.pm
router.get('/booth.pm/shop/:subdomain', require('./routes/booth-pm/shop'));

// Minecraft feed the beast
router.get('/feed-the-beast/modpack/:modpackEntry', require('./routes/feed-the-beast/modpack'));

// Gab
router.get('/gab/user/:username', require('./routes/gab/user'));
router.get('/gab/popular/:sort?', require('./routes/gab/explore'));

// NEW 字幕组
router.get('/newzmz/view/:id', require('./routes/newzmz/view'));
router.get('/newzmz/:category?', require('./routes/newzmz/index'));

// Phrack Magazine
router.get('/phrack', require('./routes/phrack/index'));

// 通識·現代中國
router.get('/chiculture/topic/:category?', require('./routes/chiculture/topic'));

// CQUT News
router.get('/cqut/news', require('./routes/universities/cqut/cqut-news'));
router.get('/cqut/libnews', require('./routes/universities/cqut/cqut-libnews'));

// 城农 Growin' City
router.get('/growincity/news/:id?', require('./routes/growincity/news'));

// Thrillist
router.get('/thrillist/:tag?', require('./routes/thrillist/index'));

// 丁香园
router.get('/dxy/vaccine/:province?/:city?/:location?', require('./routes/dxy/vaccine'));

// Wtu
router.get('/wtu/:type', require('./routes/universities/wtu'));

// 中国庭审公开网
router.get('/tingshen', require('./routes/tingshen/tingshen'));

// 中华人民共和国人力资源和社会保障部
router.get('/gov/mohrss/sbjm/:category?', require('./routes/gov/mohrss/sbjm'));

// 深影译站
router.get('/shinybbs/latest', require('./routes/shinybbs/latest'));
router.get('/shinybbs/p/:id', require('./routes/shinybbs/p'));
router.get('/shinybbs/page/:id?', require('./routes/shinybbs/index'));
router.get('/shinybbs', require('./routes/shinybbs/index'));

// 天眼查
router.get('/tianyancha/hot', require('./routes/tianyancha/hot'));

// King Arthur
router.get('/kingarthur/:type', require('./routes/kingarthur/index'));

// 新华网
router.get('/news/whxw', require('./routes/news/whxw'));

// 游讯网
router.get('/yxdown/recommend', require('./routes/yxdown/recommend'));

// BabeHub
router.get('/babehub/search/:keyword?', require('./routes/babehub/search'));
router.get('/babehub/:category?', require('./routes/babehub/index'));

// 深圳新闻网
router.get('/sznews/ranking', require('./routes/sznews/ranking'));

// Shuax
router.get('/shuax/project/:name?', require('./routes/shuax/project'));

// BioOne
router.get('/bioone/featured', require('./routes/bioone/featured'));

// Obsidian
router.get('/obsidian/announcements', require('./routes/obsidian/announcements'));

// 吉林工商学院
router.get('/jlbtc/kyc/:category?', require('./routes/universities/jlbtc/kyc'));
router.get('/jlbtc/jwc/:id?', require('./routes/universities/jlbtc/jwc'));
router.get('/jlbtc/:category?', require('./routes/universities/jlbtc/index'));

// DT 财经
router.get('/dtcj/datahero/:category?', require('./routes/dtcj/datahero'));

// 劍心．回憶
router.get('/kenshin/:category?/:type?', require('./routes/kenshin/index'));

// av01
router.get('/av01/actor/:name/:type?', require('./routes/av01/actor'));
router.get('/av01/tag/:name/:type?', require('./routes/av01/tag'));

// macked
router.get('/macked/app/:name', require('./routes/macked/app'));

// 美国劳工联合会-产业工会联合会
router.get('/aflcio/blog', require('./routes/aflcio/blog'));

// Fur Affinity
router.get('/furaffinity/home/:type?/:nsfw?', require('./routes/furaffinity/home'));
router.get('/furaffinity/browse/:nsfw?', require('./routes/furaffinity/browse'));
router.get('/furaffinity/status', require('./routes/furaffinity/status'));
router.get('/furaffinity/search/:keyword/:nsfw?', require('./routes/furaffinity/search'));
router.get('/furaffinity/user/:username', require('./routes/furaffinity/user'));
router.get('/furaffinity/watching/:username', require('./routes/furaffinity/watching'));
router.get('/furaffinity/watchers/:username', require('./routes/furaffinity/watchers'));
router.get('/furaffinity/commissions/:username', require('./routes/furaffinity/commissions'));
router.get('/furaffinity/shouts/:username', require('./routes/furaffinity/shouts'));
router.get('/furaffinity/journals/:username', require('./routes/furaffinity/journals'));
router.get('/furaffinity/gallery/:username/:nsfw?', require('./routes/furaffinity/gallery'));
router.get('/furaffinity/scraps/:username/:nsfw?', require('./routes/furaffinity/scraps'));
router.get('/furaffinity/favorites/:username/:nsfw?', require('./routes/furaffinity/favorites'));
router.get('/furaffinity/submission_comments/:id', require('./routes/furaffinity/submission_comments'));
router.get('/furaffinity/journal_comments/:id', require('./routes/furaffinity/journal_comments'));

// Logseq
router.get('/logseq/changelog', require('./routes/logseq/changelog'));

// 亿欧网
router.get('/iyiou', require('./routes/iyiou'));

// 香港商报
router.get('/hkcd/pdf', require('./routes/hkcd/pdf'));

// 博客来
router.get('/bookscomtw/newbooks/:category', require('./routes/bookscomtw/newbooks'));

// Elite Babes
router.get('/elitebabes/videos/:sort?', require('./routes/elitebabes/videos'));
router.get('/elitebabes/search/:keyword?', require('./routes/elitebabes/search'));
router.get('/elitebabes/:category?', require('./routes/elitebabes/index'));

// Trakt.tv
router.get('/trakt/collection/:username/:type?', require('./routes/trakt/collection'));

// 全球化智库
router.get('/ccg/:category?', require('./routes/ccg/index'));

// 少女前线
router.get('/gf-cn/news/:category?', require('./routes/gf-cn/news'));

// Eagle
router.get('/eagle/changelog/:language?', require('./routes/eagle/changelog'));

// ezone.hk
router.get('/ezone/:category?', require('./routes/ezone/index'));

// 中国橡胶网
router.get('/cria/news/:id?', require('./routes/cria/news'));

// 灵异网
router.get('/lingyi/:category', require('./routes/lingyi/index'));

// 歪脑读
router.get('/wainao-reads/all-articles', require('./routes/wainao/index'));

// react
router.get('/react/react-native-weekly', require('./routes/react/react-native-weekly'));

// dbaplus 社群
router.get('/dbaplus/:tab?', require('./routes/dbaplus/tab'));

// 梨园
router.get('/liyuan-forums/threads', require('./routes/liyuan-forums/threads'));
router.get('/liyuan-forums/threads/forum/:forum_id', require('./routes/liyuan-forums/threads'));
router.get('/liyuan-forums/threads/topic/:topic_id', require('./routes/liyuan-forums/threads'));
router.get('/liyuan-forums/threads/user/:user_id', require('./routes/liyuan-forums/threads'));

// 集思录
router.get('/jisilu/reply/:user', require('./routes/jisilu/reply'));
router.get('/jisilu/topic/:user', require('./routes/jisilu/topic'));

// Constitutional Court of Baden-Württemberg (Germany)
router.get('/verfghbw/press/:keyword?', require('./routes/verfghbw/press'));

// Topbook
router.get('/topbook/today', require('./routes/topbook/today'));

// Melon
router.get('/melon/chart/:category?', require('./routes/melon/chart'));

// 弯弯字幕组
router.get('/wanwansub/info/:id', require('./routes/wanwansub/info'));
router.get('/wanwansub/:id?', require('./routes/wanwansub/index'));

// FIX 字幕侠
router.get('/zimuxia/portfolio/:id', require('./routes/zimuxia/portfolio'));
router.get('/zimuxia/:category?', require('./routes/zimuxia/index'));

// Bandcamp
router.get('/bandcamp/tag/:tag?', require('./routes/bandcamp/tag'));

// Hugo 更新日志
router.get('/hugo/releases', require('./routes/hugo/releases'));

// 东立出版
router.get('/tongli/news/:type', require('./routes/tongli/news'));

// OR
router.get('/or/:id?', require('./routes/or'));

module.exports = router;
