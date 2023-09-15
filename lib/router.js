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

// 1draw
router.get('/1draw', lazyloadRouteHandler('./routes/1draw/index'));

// Benedict Evans
router.get('/benedictevans', lazyloadRouteHandler('./routes/benedictevans/recent.js'));

// 自如
router.get('/ziroom/room/:city/:iswhole/:room/:keyword', lazyloadRouteHandler('./routes/ziroom/room'));

// 简书
router.get('/jianshu/home', lazyloadRouteHandler('./routes/jianshu/home'));
router.get('/jianshu/trending/:timeframe', lazyloadRouteHandler('./routes/jianshu/trending'));
router.get('/jianshu/collection/:id', lazyloadRouteHandler('./routes/jianshu/collection'));
router.get('/jianshu/user/:id', lazyloadRouteHandler('./routes/jianshu/user'));

// 妹子图
router.get('/mzitu/home/:type?', lazyloadRouteHandler('./routes/mzitu/home'));
router.get('/mzitu/tags', lazyloadRouteHandler('./routes/mzitu/tags'));
router.get('/mzitu/category/:category', lazyloadRouteHandler('./routes/mzitu/category'));
router.get('/mzitu/post/:id', lazyloadRouteHandler('./routes/mzitu/post'));
router.get('/mzitu/tag/:tag', lazyloadRouteHandler('./routes/mzitu/tag'));

// pixiv-fanbox
router.get('/fanbox/:user?', lazyloadRouteHandler('./routes/fanbox/main'));

// 法律白話文運動
router.get('/plainlaw/archives', lazyloadRouteHandler('./routes/plainlaw/archives.js'));

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

// 极客时间
router.get('/geektime/column/:cid', lazyloadRouteHandler('./routes/geektime/column'));
router.get('/geektime/news', lazyloadRouteHandler('./routes/geektime/news'));

// 南方周末
router.get('/infzm/:id', lazyloadRouteHandler('./routes/infzm/news'));

// Dribbble
// router.get('/dribbble/popular/:timeframe?', lazyloadRouteHandler('./routes/dribbble/popular'));
// router.get('/dribbble/user/:name', lazyloadRouteHandler('./routes/dribbble/user'));
// router.get('/dribbble/keyword/:keyword', lazyloadRouteHandler('./routes/dribbble/keyword'));

// 虎牙
router.get('/huya/live/:id', lazyloadRouteHandler('./routes/huya/live'));

// SHOWROOM直播
router.get('/showroom/room/:id', lazyloadRouteHandler('./routes/showroom/room'));

// v2ex
// router.get('/v2ex/topics/:type', lazyloadRouteHandler('./routes/v2ex/topics'));
// router.get('/v2ex/post/:postid', lazyloadRouteHandler('./routes/v2ex/post'));
// router.get('/v2ex/tab/:tabid', lazyloadRouteHandler('./routes/v2ex/tab'));

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
// router.get('/pornhub/category/:caty', lazyloadRouteHandler('./routes/pornhub/category'));
// router.get('/pornhub/search/:keyword', lazyloadRouteHandler('./routes/pornhub/search'));
// router.get('/pornhub/:language?/category_url/:url?', lazyloadRouteHandler('./routes/pornhub/category_url'));
// router.get('/pornhub/:language?/users/:username', lazyloadRouteHandler('./routes/pornhub/users'));
// router.get('/pornhub/:language?/model/:username/:sort?', lazyloadRouteHandler('./routes/pornhub/model'));
// router.get('/pornhub/:language?/pornstar/:username/:sort?', lazyloadRouteHandler('./routes/pornhub/pornstar'));

// yande.re
router.get('/yande.re/post/popular_recent', lazyloadRouteHandler('./routes/yande.re/post_popular_recent'));
router.get('/yande.re/post/popular_recent/:period', lazyloadRouteHandler('./routes/yande.re/post_popular_recent'));

// EZTV
router.get('/eztv/torrents/:imdb_id', lazyloadRouteHandler('./routes/eztv/imdb'));

// 新京报
router.get('/bjnews/:cat', lazyloadRouteHandler('./routes/bjnews/news'));
router.get('/bjnews/epaper/:cat', lazyloadRouteHandler('./routes/bjnews/epaper'));

// 米哈游
router.get('/mihoyo/bh3/:type', lazyloadRouteHandler('./routes/mihoyo/bh3'));
router.get('/mihoyo/bh2/:type', lazyloadRouteHandler('./routes/mihoyo/bh2'));

// 草榴社区
router.get('/t66y/post/:tid', lazyloadRouteHandler('./routes/t66y/post'));
router.get('/t66y/:id/:type?', lazyloadRouteHandler('./routes/t66y/index'));

// 色中色
router.get('/sexinsex/:id/:type?', lazyloadRouteHandler('./routes/sexinsex/index'));

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

// 维基百科 Wikipedia
router.get('/wikipedia/mainland', lazyloadRouteHandler('./routes/wikipedia/mainland'));

// 联合国 United Nations
router.get('/un/scveto', lazyloadRouteHandler('./routes/un/scveto'));

// e 公司
router.get('/egsea/flash', lazyloadRouteHandler('./routes/egsea/flash'));

// 选股宝
router.get('/xuangubao/subject/:subject_id', lazyloadRouteHandler('./routes/xuangubao/subject'));

// Gwern Bran­wen
router.get('/gwern/:category', lazyloadRouteHandler('./routes/gwern/category'));

// LinkedKeeper
router.get('/linkedkeeper/:type/:id?', lazyloadRouteHandler('./routes/linkedkeeper/index'));

// MIT Technology Review
router.get('/technologyreview', lazyloadRouteHandler('./routes/technologyreview/index'));
router.get('/technologyreview/:category_name', lazyloadRouteHandler('./routes/technologyreview/topic'));

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

// 北京交通大学
router.get('/bjtu/gs/:type', lazyloadRouteHandler('./routes/universities/bjtu/gs'));

// 大连工业大学
router.get('/dpu/jiaowu/news/:type?', lazyloadRouteHandler('./routes/universities/dpu/jiaowu/news'));
router.get('/dpu/wlfw/news/:type?', lazyloadRouteHandler('./routes/universities/dpu/wlfw/news'));

// 南京工业大学
router.get('/njtech/jwc', lazyloadRouteHandler('./routes/universities/njtech/jwc'));

// 河海大学
router.get('/hhu/libNews', lazyloadRouteHandler('./routes/universities/hhu/libNews'));
// 河海大学常州校区
router.get('/hhu/libNewsc', lazyloadRouteHandler('./routes/universities/hhu/libNewsc'));

// 上海科技大学
router.get('/shanghaitech/activity', lazyloadRouteHandler('./routes/universities/shanghaitech/activity'));
router.get('/shanghaitech/sist/activity', lazyloadRouteHandler('./routes/universities/shanghaitech/sist/activity'));

// 江南大学
router.get('/ju/jwc/:type?', lazyloadRouteHandler('./routes/universities/ju/jwc'));

// 洛阳理工学院
router.get('/lit/jwc', lazyloadRouteHandler('./routes/universities/lit/jwc'));
router.get('/lit/xwzx/:name?', lazyloadRouteHandler('./routes/universities/lit/xwzx'));
router.get('/lit/tw/:name?', lazyloadRouteHandler('./routes/universities/lit/tw'));

// 清华大学
router.get('/thu/career', lazyloadRouteHandler('./routes/universities/thu/career'));
router.get('/thu/:type', lazyloadRouteHandler('./routes/universities/thu/index'));

// 上海海洋大学
router.get('/shou/www/:type', lazyloadRouteHandler('./routes/universities/shou/www'));

// 西南科技大学
router.get('/swust/jwc/news', lazyloadRouteHandler('./routes/universities/swust/jwc_news'));
router.get('/swust/jwc/notice/:type?', lazyloadRouteHandler('./routes/universities/swust/jwc_notice'));
router.get('/swust/cs/:type?', lazyloadRouteHandler('./routes/universities/swust/cs'));

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
// router.get('/whu/cs/:type', lazyloadRouteHandler('./routes/universities/whu/cs'));
// router.get('/whu/news/:type?', lazyloadRouteHandler('./routes/universities/whu/news'));

// 井冈山大学
router.get('/jgsu/jwc', lazyloadRouteHandler('./routes/universities/jgsu/jwc'));

// 大连大学
router.get('/dlu/jiaowu/news', lazyloadRouteHandler('./routes/universities/dlu/jiaowu/news'));

// 东莞理工学院
router.get('/dgut/jwc/:type?', lazyloadRouteHandler('./routes/universities/dgut/jwc'));
router.get('/dgut/xsc/:type?', lazyloadRouteHandler('./routes/universities/dgut/xsc'));

// 温州商学院
router.get('/wzbc/:type?', lazyloadRouteHandler('./routes/universities/wzbc/news'));

// 河南大学
router.get('/henu/:type?', lazyloadRouteHandler('./routes/universities/henu/news'));

// 南开大学
router.get('/nku/jwc/:type?', lazyloadRouteHandler('./routes/universities/nku/jwc/index'));

// 北京航空航天大学
router.get('/buaa/news/:type', lazyloadRouteHandler('./routes/universities/buaa/news/index'));

// 浙江工业大学
router.get('/zjut/:type', lazyloadRouteHandler('./routes/universities/zjut/index'));
router.get('/zjut/design/:type', lazyloadRouteHandler('./routes/universities/zjut/design'));

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

// IPSW.me
router.get('/ipsw/index/:ptype/:pname', lazyloadRouteHandler('./routes/ipsw/index'));

// Minecraft CurseForge
router.get('/curseforge/files/:project', lazyloadRouteHandler('./routes/curseforge/files'));

// 异次元软件世界
router.get('/iplay/home', lazyloadRouteHandler('./routes/iplay/home'));

// xclient.info
router.get('/xclient/app/:name', lazyloadRouteHandler('./routes/xclient/app'));

// 电影首发站
router.get('/dysfz', lazyloadRouteHandler('./routes/dysfz/index'));
router.get('/dysfz/index', lazyloadRouteHandler('./routes/dysfz/index')); // 废弃

// きららファンタジア
router.get('/kirara/news', lazyloadRouteHandler('./routes/kirara/news'));

// 电影天堂
router.get('/dytt', lazyloadRouteHandler('./routes/dytt/index'));
router.get('/dytt/index', lazyloadRouteHandler('./routes/dytt/index')); // 废弃

// 人生05电影网
router.get('/rs05/rs05', lazyloadRouteHandler('./routes/rs05/rs05'));

// 趣头条
router.get('/qutoutiao/category/:cid', lazyloadRouteHandler('./routes/qutoutiao/category'));

// BBC
// router.get('/bbc/:site?/:channel?', lazyloadRouteHandler('./routes/bbc/index'));

// 看雪
router.get('/pediy/topic/:category?/:type?', lazyloadRouteHandler('./routes/pediy/topic'));

// 知晓程序
router.get('/miniapp/article/:category', lazyloadRouteHandler('./routes/miniapp/article'));
router.get('/miniapp/store/newest', lazyloadRouteHandler('./routes/miniapp/store/newest'));

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

// Westore
router.get('/westore/new', lazyloadRouteHandler('./routes/westore/new'));

// 龙腾网
router.get('/ltaaa/:category?', lazyloadRouteHandler('./routes/ltaaa/index'));

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

// TSSstatus
router.get('/tssstatus/:board/:build', lazyloadRouteHandler('./routes/tssstatus'));

// Anime1
router.get('/anime1/anime/:time/:name', lazyloadRouteHandler('./routes/anime1/anime'));
router.get('/anime1/search/:keyword', lazyloadRouteHandler('./routes/anime1/search'));

// gitea
router.get('/gitea/blog', lazyloadRouteHandler('./routes/gitea/blog'));

// iDownloadBlog
router.get('/idownloadblog', lazyloadRouteHandler('./routes/idownloadblog/index'));

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

// 動畫瘋
router.get('/anigamer/new_anime', lazyloadRouteHandler('./routes/anigamer/new_anime'));
router.get('/anigamer/anime/:sn', lazyloadRouteHandler('./routes/anigamer/anime'));

// 中国药科大学
router.get('/cpu/home', lazyloadRouteHandler('./routes/universities/cpu/home'));
router.get('/cpu/jwc', lazyloadRouteHandler('./routes/universities/cpu/jwc'));
router.get('/cpu/yjsy', lazyloadRouteHandler('./routes/universities/cpu/yjsy'));

// 字幕组
router.get('/zimuzu/resource/:id?', lazyloadRouteHandler('./routes/zimuzu/resource'));
router.get('/zimuzu/top/:range/:type', lazyloadRouteHandler('./routes/zimuzu/top'));

// 字幕库
router.get('/zimuku/:type?', lazyloadRouteHandler('./routes/zimuku/index'));

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

// 创业邦
// router.get('/cyzone/author/:id', lazyloadRouteHandler('./routes/cyzone/author'));
// router.get('/cyzone/label/:name', lazyloadRouteHandler('./routes/cyzone/label'));

// 政府
// router.get('/gov/zhengce/zuixin', lazyloadRouteHandler('./routes/gov/zhengce/zuixin'));
// router.get('/gov/zhengce/wenjian/:pcodeJiguan?', lazyloadRouteHandler('./routes/gov/zhengce/wenjian'));
// router.get('/gov/zhengce/govall/:advance?', lazyloadRouteHandler('./routes/gov/zhengce/govall'));
router.get('/gov/province/:name/:category', lazyloadRouteHandler('./routes/gov/province'));
router.get('/gov/city/:name/:category', lazyloadRouteHandler('./routes/gov/city'));
router.get('/gov/statecouncil/briefing', lazyloadRouteHandler('./routes/gov/statecouncil/briefing'));
// router.get('/gov/news/:uid', lazyloadRouteHandler('./routes/gov/news'));
router.get('/gov/shuju/:caty/:item', lazyloadRouteHandler('./routes/gov/shuju'));
router.get('/gov/xinwen/tujie/:caty', lazyloadRouteHandler('./routes/gov/xinwen/tujie'));

// 苏州
router.get('/gov/suzhou/news/:uid', lazyloadRouteHandler('./routes/gov/suzhou/news'));
router.get('/gov/suzhou/doc', lazyloadRouteHandler('./routes/gov/suzhou/doc'));

// 山西
router.get('/gov/shanxi/rst/:category', lazyloadRouteHandler('./routes/gov/shanxi/rst'));

// 湖南
router.get('/gov/hunan/notice/:type', lazyloadRouteHandler('./routes/gov/hunan/notice'));

// 中华人民共和国国家发展和改革委员会
router.get('/gov/ndrc/xwdt/:caty?', lazyloadRouteHandler('./routes/gov/ndrc/xwdt'));

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

// 日本国外務省記者会見
router.get('/go.jp/mofa', lazyloadRouteHandler('./routes/go.jp/mofa/main'));

// 小黑盒
router.get('/xiaoheihe/user/:id', lazyloadRouteHandler('./routes/xiaoheihe/user'));
router.get('/xiaoheihe/news', lazyloadRouteHandler('./routes/xiaoheihe/news'));
router.get('/xiaoheihe/discount/:platform?', lazyloadRouteHandler('./routes/xiaoheihe/discount'));

// 惠誉评级
router.get('/fitchratings/site/:type', lazyloadRouteHandler('./routes/fitchratings/site'));

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

// 高清电台
router.get('/gaoqing/latest', lazyloadRouteHandler('./routes/gaoqing/latest'));

// 鲸跃汽车
router.get('/whalegogo/home', lazyloadRouteHandler('./routes/whalegogo/home'));
router.get('/whalegogo/portal/:type_id/:tagid?', lazyloadRouteHandler('./routes/whalegogo/portal'));

// LeetCode
// router.get('/leetcode/articles', lazyloadRouteHandler('./routes/leetcode/articles'));
router.get('/leetcode/submission/us/:user', lazyloadRouteHandler('./routes/leetcode/check-us'));
router.get('/leetcode/submission/cn/:user', lazyloadRouteHandler('./routes/leetcode/check-cn'));

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

// 决胜网
router.get('/juesheng', lazyloadRouteHandler('./routes/juesheng'));

// 一些博客
// 敬维-以认真的态度做完美的事情: https://jingwei.link/
router.get('/blogs/jingwei.link', lazyloadRouteHandler('./routes/blogs/jingwei_link'));

// 王垠的博客-当然我在扯淡
router.get('/blogs/wangyin', lazyloadRouteHandler('./routes/blogs/wangyin'));

// 王五四文集
router.get('/blogs/wang54/:id?', lazyloadRouteHandler('./routes/blogs/wang54'));

// WordPress
router.get('/blogs/wordpress/:domain/:https?', lazyloadRouteHandler('./routes/blogs/wordpress'));

// 西祠胡同
router.get('/xici/:id?', lazyloadRouteHandler('./routes/xici'));

// 今日热榜 migrated to v2
// router.get('/tophub/:id', lazyloadRouteHandler('./routes/tophub'));

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

// gamersky
router.get('/gamersky/news', lazyloadRouteHandler('./routes/gamersky/news'));
router.get('/gamersky/ent/:category', lazyloadRouteHandler('./routes/gamersky/ent'));

// konami
router.get('/konami/pesmobile/:lang?/:os?', lazyloadRouteHandler('./routes/konami/pesmobile'));

// psnine
router.get('/psnine/index', lazyloadRouteHandler('./routes/psnine/index'));
router.get('/psnine/shuzhe', lazyloadRouteHandler('./routes/psnine/shuzhe'));
router.get('/psnine/trade', lazyloadRouteHandler('./routes/psnine/trade'));
router.get('/psnine/game', lazyloadRouteHandler('./routes/psnine/game'));
router.get('/psnine/news/:order?', lazyloadRouteHandler('./routes/psnine/news'));
router.get('/psnine/node/:id?/:order?', lazyloadRouteHandler('./routes/psnine/node'));

// 浙江大学城市学院
router.get('/zucc/news/latest', lazyloadRouteHandler('./routes/universities/zucc/news'));
router.get('/zucc/cssearch/latest/:webVpn/:key', lazyloadRouteHandler('./routes/universities/zucc/cssearch'));

// checkee
router.get('/checkee/:dispdate', lazyloadRouteHandler('./routes/checkee/index'));

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

// 福利资源-met.red
router.get('/metred/fuli', lazyloadRouteHandler('./routes/metred/fuli'));

// MIT
router.get('/mit/graduateadmissions/:type/:name', lazyloadRouteHandler('./routes/universities/mit/graduateadmissions'));
router.get('/mit/ocw-top', lazyloadRouteHandler('./routes/universities/mit/ocw-top'));
router.get('/mit/csail/news', lazyloadRouteHandler('./routes/universities/mit/csail/news'));

// 毕马威
router.get('/kpmg/insights', lazyloadRouteHandler('./routes/kpmg/insights'));

// gradcafe
router.get('/gradcafe/result/:type', lazyloadRouteHandler('./routes/gradcafe/result'));
router.get('/gradcafe/result', lazyloadRouteHandler('./routes/gradcafe/result'));

// 鼠绘漫画
router.get('/shuhui/comics/:id', lazyloadRouteHandler('./routes/shuhui/comics'));

// 朝日新闻
router.get('/asahi/area/:id', lazyloadRouteHandler('./routes/asahi/area'));
router.get('/asahi/:genre?/:category?', lazyloadRouteHandler('./routes/asahi/index'));

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
// router.get('/boc/whpj/:format?', lazyloadRouteHandler('./routes/boc/whpj'));

// 漫画db
router.get('/manhuadb/comics/:id', lazyloadRouteHandler('./routes/manhuadb/comics'));

// 装备前线
router.get('/zfrontier/postlist/:type', lazyloadRouteHandler('./routes/zfrontier/postlist'));
router.get('/zfrontier/board/:boardId', lazyloadRouteHandler('./routes/zfrontier/board_postlist'));

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

// 飞地
router.get('/enclavebooks/category/:id?', lazyloadRouteHandler('./routes/enclavebooks/category'));
router.get('/enclavebooks/user/:uid', lazyloadRouteHandler('./routes/enclavebooks/user.js'));
router.get('/enclavebooks/collection/:uid', lazyloadRouteHandler('./routes/enclavebooks/collection.js'));

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

// AlgoCasts
router.get('/algocasts', lazyloadRouteHandler('./routes/algocasts/all'));

// aqicn
router.get('/aqicn/:city/:pollution?', lazyloadRouteHandler('./routes/aqicn/index'));

// 猫眼电影
router.get('/maoyan/hot', lazyloadRouteHandler('./routes/maoyan/hot'));
router.get('/maoyan/upcoming', lazyloadRouteHandler('./routes/maoyan/upcoming'));
router.get('/maoyan/hotComplete/:orderby?/:ascOrDesc?/:top?', lazyloadRouteHandler('./routes/maoyan/hotComplete'));

// 国家退伍士兵信息
router.get('/gov/veterans/:type', lazyloadRouteHandler('./routes/gov/veterans/china'));

// 河北省退伍士兵信息
router.get('/gov/veterans/hebei/:type', lazyloadRouteHandler('./routes/gov/veterans/hebei'));

// Dilbert Comic Strip
router.get('/dilbert/strip', lazyloadRouteHandler('./routes/dilbert/strip'));

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

// Metacritic
router.get('/metacritic/release/:platform/:type/:sort?', lazyloadRouteHandler('./routes/metacritic/release'));

// 快科技（原驱动之家）
router.get('/kkj/news', lazyloadRouteHandler('./routes/kkj/news'));

// sixthtone
router.get('/sixthtone/news', lazyloadRouteHandler('./routes/sixthtone/news'));

// AI研习社
router.get('/aiyanxishe/:id/:sort?', lazyloadRouteHandler('./routes/aiyanxishe/home'));

// 活动行
router.get('/huodongxing/explore', lazyloadRouteHandler('./routes/hdx/explore'));

// 巴比特作者专栏
router.get('/8btc/:authorid', lazyloadRouteHandler('./routes/8btc/author'));
router.get('/8btc/news/flash', lazyloadRouteHandler('./routes/8btc/news/flash'));

// VueVlog
router.get('/vuevideo/:userid', lazyloadRouteHandler('./routes/vuevideo/user'));

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

// im2maker
router.get('/im2maker/:channel?', lazyloadRouteHandler('./routes/im2maker/index'));

// 巨潮资讯
router.get('/cninfo/announcement/:column/:code/:orgId/:category?/:search?', lazyloadRouteHandler('./routes/cninfo/announcement'));

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

// 塞壬唱片
router.get('/siren/news', lazyloadRouteHandler('./routes/siren/index'));

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

// 一兜糖
router.get('/yidoutang/index', lazyloadRouteHandler('./routes/yidoutang/index.js'));
router.get('/yidoutang/guide', lazyloadRouteHandler('./routes/yidoutang/guide.js'));
router.get('/yidoutang/mtest', lazyloadRouteHandler('./routes/yidoutang/mtest.js'));
router.get('/yidoutang/case/:type', lazyloadRouteHandler('./routes/yidoutang/case.js'));

// 开眼
router.get('/kaiyan/index', lazyloadRouteHandler('./routes/kaiyan/index'));

// 坂道系列资讯
// 坂道系列官网新闻
router.get('/keyakizaka46/news', lazyloadRouteHandler('./routes/keyakizaka46/news'));
// router.get('/hinatazaka46/news', lazyloadRouteHandler('./routes/hinatazaka46/news'));
router.get('/keyakizaka46/blog', lazyloadRouteHandler('./routes/keyakizaka46/blog'));
// router.get('/hinatazaka46/blog', lazyloadRouteHandler('./routes/hinatazaka46/blog'));
// router.get('/sakurazaka46/blog', lazyloadRouteHandler('./routes/sakurazaka46/blog'));

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

// 礼物说
router.get('/liwushuo/index', lazyloadRouteHandler('./routes/liwushuo/index.js'));

// 中国日报
router.get('/chinadaily/english/:category', lazyloadRouteHandler('./routes/chinadaily/english.js'));

// leboncoin
router.get('/leboncoin/ad/:query', lazyloadRouteHandler('./routes/leboncoin/ad.js'));

// DHL
router.get('/dhl/:id', lazyloadRouteHandler('./routes/dhl/shipment-tracking'));

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

// 前端艺术家每日整理&&飞冰早报
router.get('/jskou/:type?', lazyloadRouteHandler('./routes/jskou/index'));

// 邮箱
// router.get('/mail/imap/:email/:folder*', lazyloadRouteHandler('./routes/mail/imap'));

// 好队友
router.get('/network360/jobs', lazyloadRouteHandler('./routes/network360/jobs'));

// 智联招聘
router.get('/zhilian/:city/:keyword', lazyloadRouteHandler('./routes/zhilian/index'));

// 北华航天工业学院 - 新闻
router.get('/nciae/news', lazyloadRouteHandler('./routes/universities/nciae/news'));
// 北华航天工业学院 - 通知公告
router.get('/nciae/tzgg', lazyloadRouteHandler('./routes/universities/nciae/tzgg'));
// 北华航天工业学院 - 学术信息
router.get('/nciae/xsxx', lazyloadRouteHandler('./routes/universities/nciae/xsxx'));

// cfan
router.get('/cfan/news', lazyloadRouteHandler('./routes/cfan/news'));

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

// 米坛社区表盘
router.get('/watchface/:watch_type?/:list_type?', lazyloadRouteHandler('./routes/watchface/update'));

// CNU视觉联盟
router.get('/cnu/selected', lazyloadRouteHandler('./routes/cnu/selected'));
router.get('/cnu/discovery/:type?/:category?', lazyloadRouteHandler('./routes/cnu/discovery'));

// 战旗直播
router.get('/zhanqi/room/:id', lazyloadRouteHandler('./routes/zhanqi/room'));

// 酒云网
router.get('/wineyun/:category', lazyloadRouteHandler('./routes/wineyun'));

// 快知
router.get('/kzfeed/topic/:id', lazyloadRouteHandler('./routes/kzfeed/topic'));

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

// eLife [Sci Journal]
router.get('/elife/:tid', lazyloadRouteHandler('./routes/elife/index'));

// IEEE Xplore [Sci Journal]
router.get('/ieee/author/:aid/:sortType/:count?', lazyloadRouteHandler('./routes/ieee/author'));

// PNAS [Sci Journal]
// router.get('/pnas/:topic?', lazyloadRouteHandler('./routes/pnas/index'));

// cell [Sci Journal]
router.get('/cell/cell/:category', lazyloadRouteHandler('./routes/cell/cell/index'));
router.get('/cell/cover', lazyloadRouteHandler('./routes/cell/cover'));

// mcbbs
router.get('/mcbbs/forum/:type', lazyloadRouteHandler('./routes/mcbbs/forum'));
router.get('/mcbbs/post/:tid/:authorid?', lazyloadRouteHandler('./routes/mcbbs/post'));

// Pocket
router.get('/pocket/trending', lazyloadRouteHandler('./routes/pocket/trending'));

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

// chocolatey
router.get('/chocolatey/software/:name?', lazyloadRouteHandler('./routes/chocolatey/software'));

// 巴哈姆特
router.get('/bahamut/creation/:author/:category?', lazyloadRouteHandler('./routes/bahamut/creation'));
router.get('/bahamut/creation_index/:category?/:subcategory?/:type?', lazyloadRouteHandler('./routes/bahamut/creation_index'));

// CentBrowser
router.get('/centbrowser/history', lazyloadRouteHandler('./routes/centbrowser/history'));

// 755
router.get('/755/user/:username', lazyloadRouteHandler('./routes/755/user'));

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

// Yahoo!テレビ
router.get('/yahoo-jp-tv/:query', lazyloadRouteHandler('./routes/yahoo-jp-tv/index'));

// Yahoo! by Author
router.get('/yahoo-author/:author', lazyloadRouteHandler('./routes/yahoo-author/index'));

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

// 新趣集
router.get('/xinquji/today', lazyloadRouteHandler('./routes/xinquji/today'));
router.get('/xinquji/today/internal', lazyloadRouteHandler('./routes/xinquji/internal'));

// 英中协会
router.get('/gbcc/trust', lazyloadRouteHandler('./routes/gbcc/trust'));

// CBC
router.get('/cbc/topics/:topic?', lazyloadRouteHandler('./routes/cbc/topics'));

// discuz
// router.get('/discuz/:ver([7|x])/:cid([0-9]{2})/:link(.*)', lazyloadRouteHandler('./routes/discuz/discuz'));
// router.get('/discuz/:ver([7|x])/:link(.*)', lazyloadRouteHandler('./routes/discuz/discuz'));
// router.get('/discuz/:link(.*)', lazyloadRouteHandler('./routes/discuz/discuz'));

// China Dialogue 中外对话
router.get('/chinadialogue/topics/:topic', lazyloadRouteHandler('./routes/chinadialogue/topics'));
router.get('/chinadialogue/:column', lazyloadRouteHandler('./routes/chinadialogue/column'));

// 人民日报社 国际金融报
router.get('/ifnews/:cid', lazyloadRouteHandler('./routes/ifnews/column'));

// Scala Blog
router.get('/scala/blog/:part?', lazyloadRouteHandler('./routes/scala-blog/scala-blog'));

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

// MQube
router.get('/mqube/user/:user', lazyloadRouteHandler('./routes/mqube/user'));
router.get('/mqube/tag/:tag', lazyloadRouteHandler('./routes/mqube/tag'));
router.get('/mqube/latest', lazyloadRouteHandler('./routes/mqube/latest'));
router.get('/mqube/top', lazyloadRouteHandler('./routes/mqube/top'));

// Letterboxd
router.get('/letterboxd/user/diary/:username', lazyloadRouteHandler('./routes/letterboxd/userdiary'));
router.get('/letterboxd/user/followingdiary/:username', lazyloadRouteHandler('./routes/letterboxd/followingdiary'));

// Last.FM
router.get('/lastfm/recent/:user', lazyloadRouteHandler('./routes/lastfm/recent'));
router.get('/lastfm/loved/:user', lazyloadRouteHandler('./routes/lastfm/loved'));
router.get('/lastfm/top/:country?', lazyloadRouteHandler('./routes/lastfm/top'));

// piapro
router.get('/piapro/user/:pid', lazyloadRouteHandler('./routes/piapro/user'));
router.get('/piapro/public/:type/:tag?/:category?', lazyloadRouteHandler('./routes/piapro/public'));

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

// 虛詞
router.get('/p-articles/section/:section', lazyloadRouteHandler('./routes/p-articles/section'));
router.get('/p-articles/contributors/:author', lazyloadRouteHandler('./routes/p-articles/contributors'));

// 好好住
router.get('/haohaozhu/whole-house/:keyword?', lazyloadRouteHandler('./routes/haohaozhu/whole-house'));
router.get('/haohaozhu/discover/:keyword?', lazyloadRouteHandler('./routes/haohaozhu/discover'));

// 稻草人书屋
router.get('/dcrsw/:name/:count?', lazyloadRouteHandler('./routes/novel/dcrsw'));

// 魔法纪录
router.get('/magireco/announcements', lazyloadRouteHandler('./routes/magireco/announcements'));
router.get('/magireco/event_banner', lazyloadRouteHandler('./routes/magireco/event_banner'));

// wolley
router.get('/wolley', lazyloadRouteHandler('./routes/wolley/index'));
router.get('/wolley/user/:id', lazyloadRouteHandler('./routes/wolley/user'));
router.get('/wolley/host/:host', lazyloadRouteHandler('./routes/wolley/host'));

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

// 广州航海学院
router.get('/gzmtu/jwc', lazyloadRouteHandler('./routes/universities/gzmtu/jwc'));
router.get('/gzmtu/tsg', lazyloadRouteHandler('./routes/universities/gzmtu/tsg'));

// 暨南大学
router.get('/jnu/xysx/:type', lazyloadRouteHandler('./routes/universities/jnu/xysx/index'));
router.get('/jnu/yw/:type?', lazyloadRouteHandler('./routes/universities/jnu/yw/index'));

// moxingfans
router.get('/moxingfans', lazyloadRouteHandler('./routes/moxingfans'));

// Chiphell
router.get('/chiphell/forum/:forumId?', lazyloadRouteHandler('./routes/chiphell/forum'));

// 考研帮调剂信息
router.get('/kaoyan', lazyloadRouteHandler('./routes/kaoyan/kaoyan'));

// WEEX
router.get('/weexcn/news/:typeid', lazyloadRouteHandler('./routes/weexcn/index'));

// 湖南科技大学教务处
router.get('/hnust/jwc', lazyloadRouteHandler('./routes/universities/hnust/jwc/index'));
router.get('/hnust/computer', lazyloadRouteHandler('./routes/universities/hnust/computer/index'));
router.get('/hnust/art', lazyloadRouteHandler('./routes/universities/hnust/art/index'));
router.get('/hnust/chem', lazyloadRouteHandler('./routes/universities/hnust/chem/index'));
router.get('/hnust/graduate/:type?', lazyloadRouteHandler('./routes/universities/hnust/graduate/index'));

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

// Grub Street
router.get('/grubstreet', lazyloadRouteHandler('./routes/grubstreet/index'));

// 漫画堆
router.get('/manhuadui/manhua/:name/:serial?', lazyloadRouteHandler('./routes/manhuadui/manhua'));

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

// 中国信息通信研究院
router.get('/gov/caict/bps', lazyloadRouteHandler('./routes/gov/caict/bps'));
router.get('/gov/caict/qwsj', lazyloadRouteHandler('./routes/gov/caict/qwsj'));
router.get('/gov/caict/caictgd', lazyloadRouteHandler('./routes/gov/caict/caictgd'));

// 中证网
router.get('/cs/news/:caty', lazyloadRouteHandler('./routes/cs/news'));

// hentai-cosplays
router.get('/hentai-cosplays/:type?/:name?', lazyloadRouteHandler('./routes/hentai-cosplays/hentai-cosplays'));
router.get('/porn-images-xxx/:type?/:name?', lazyloadRouteHandler('./routes/hentai-cosplays/porn-images-xxx'));

// dcinside
router.get('/dcinside/board/:id', lazyloadRouteHandler('./routes/dcinside/board'));

// 企鹅电竞
router.get('/egameqq/room/:id', lazyloadRouteHandler('./routes/tencent/egame/room'));

// 荔枝FM
router.get('/lizhi/user/:id', lazyloadRouteHandler('./routes/lizhi/user'));

// Boston.com
router.get('/boston/:tag?', lazyloadRouteHandler('./routes/boston/index'));

// 场库
router.get('/changku', lazyloadRouteHandler('./routes/changku/index'));
router.get('/changku/cate/:postid', lazyloadRouteHandler('./routes/changku/index'));

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

// popiask提问箱
router.get('/popiask/:sharecode/:pagesize?', lazyloadRouteHandler('./routes/popiask/questions'));

// Tapechat提问箱
router.get('/tapechat/questionbox/:sharecode/:pagesize?', lazyloadRouteHandler('./routes/popiask/tapechat_questions'));

// AMD
router.get('/amd/graphicsdrivers/:id/:rid?', lazyloadRouteHandler('./routes/amd/graphicsdrivers'));

// 电商报
router.get('/dsb/area/:area', lazyloadRouteHandler('./routes/dsb/area'));

// 靠谱新闻
router.get('/kaopunews/:language?', lazyloadRouteHandler('./routes/kaopunews'));

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

// 漫小肆
router.get('/manxiaosi/book/:id', lazyloadRouteHandler('./routes/manxiaosi/book'));

// 吉林大学校内通知
router.get('/jlu/oa', lazyloadRouteHandler('./routes/universities/jlu/oa'));

// 合肥工业大学
router.get('/hfut/tzgg', lazyloadRouteHandler('./routes/universities/hfut/tzgg'));

// OneJAV
router.get('/onejav/:type/:key?', lazyloadRouteHandler('./routes/onejav/one'));

// 水木社区
router.get('/newsmth/account/:id', lazyloadRouteHandler('./routes/newsmth/account'));
router.get('/newsmth/section/:section', lazyloadRouteHandler('./routes/newsmth/section'));

// Kotaku
router.get('/kotaku/story/:type', lazyloadRouteHandler('./routes/kotaku/story'));

// 梅斯医学
router.get('/medsci/recommend', lazyloadRouteHandler('./routes/medsci/recommend'));

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

// JustRun
router.get('/justrun', lazyloadRouteHandler('./routes/justrun/index'));

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

// 互动吧
router.get('/hudongba/:city/:id', lazyloadRouteHandler('./routes/hudongba/index'));

// 飞雪娱乐网
router.get('/feixuew/:id?', lazyloadRouteHandler('./routes/feixuew/index'));

// 1X
router.get('/1x/:category?', lazyloadRouteHandler('./routes/1x/index'));

// 剑网3
router.get('/jx3/:caty?', lazyloadRouteHandler('./routes/jx3/news'));

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

// iCity
router.get('/icity/:id', lazyloadRouteHandler('./routes/icity/index'));

// Anki
router.get('/anki/changes', lazyloadRouteHandler('./routes/anki/changes'));

// ABC News
router.get('/abc/:id?', lazyloadRouteHandler('./routes/abc'));

// 台湾中央通讯社
// router.get('/cna/:id?', lazyloadRouteHandler('./routes/cna/index'));

// 华为心声社区
router.get('/huawei/xinsheng/:caty?/:order?/:keyword?', lazyloadRouteHandler('./routes/huawei/xinsheng/index'));

// 守望先锋
router.get('/ow/patch', lazyloadRouteHandler('./routes/ow/patch'));

// 中国工程科技知识中心
router.get('/cktest/app/:ctgroup?/:domain?', lazyloadRouteHandler('./routes/cktest/app'));
router.get('/cktest/policy', lazyloadRouteHandler('./routes/cktest/policy'));

// 妈咪帮
router.get('/mamibuy/:caty?/:age?/:sort?', lazyloadRouteHandler('./routes/mamibuy/index'));

// Mercari
router.get('/mercari/:type/:id', lazyloadRouteHandler('./routes/mercari/index'));

// World Economic Forum
router.get('/weforum/report/:lang?/:year?/:platform?', lazyloadRouteHandler('./routes/weforum/report'));

// Nobel Prize
router.get('/nobelprize/:caty?', lazyloadRouteHandler('./routes/nobelprize/index'));

// 中華民國國防部
router.get('/gov/taiwan/mnd', lazyloadRouteHandler('./routes/gov/taiwan/mnd'));

// 中国人大网
router.get('/npc/:caty', lazyloadRouteHandler('./routes/npc/index'));

// 高科技行业门户
router.get('/ofweek/news', lazyloadRouteHandler('./routes/ofweek/news'));

// 八阕
router.get('/popyard/:caty?', lazyloadRouteHandler('./routes/popyard/index'));

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

// 未名新闻
router.get('/mitbbs/:caty?', lazyloadRouteHandler('./routes/mitbbs/index'));

// 贾真的电商108将
router.get('/jiazhen108', lazyloadRouteHandler('./routes/jiazhen108/index'));

// 优设网
router.get('/uisdc/talk/:sort?', lazyloadRouteHandler('./routes/uisdc/talk'));
router.get('/uisdc/hangye/:caty?', lazyloadRouteHandler('./routes/uisdc/hangye'));
router.get('/uisdc/news', lazyloadRouteHandler('./routes/uisdc/news'));
router.get('/uisdc/zt/:title?', lazyloadRouteHandler('./routes/uisdc/zt'));
router.get('/uisdc/topic/:title?/:sort?', lazyloadRouteHandler('./routes/uisdc/topic'));

// 中国劳工观察
router.get('/chinalaborwatch/reports/:lang?/:industry?', lazyloadRouteHandler('./routes/chinalaborwatch/reports'));

// 美国中央情报局
router.get('/cia/foia-annual-report', lazyloadRouteHandler('./routes/us/cia/foia-annual-report'));

// Everything
router.get('/everything/changes', lazyloadRouteHandler('./routes/everything/changes'));

// 中国劳工通讯
router.get('/clb/commentary/:lang?', lazyloadRouteHandler('./routes/clb/commentary'));

// 国际教育研究所
router.get('/iie/blog', lazyloadRouteHandler('./routes/iie/blog'));

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

// Zhimap 知识导图社区
router.get('/zhimap/:categoryUuid?/:recommend?', lazyloadRouteHandler('./routes/zhimap/index'));

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

// 有道云笔记
router.get('/youdao/xueba', lazyloadRouteHandler('./routes/youdao/xueba'));
router.get('/youdao/latest', lazyloadRouteHandler('./routes/youdao/latest'));

// 印象识堂
router.get('/yinxiang/note', lazyloadRouteHandler('./routes/yinxiang/note'));
router.get('/yinxiang/tag/:id', lazyloadRouteHandler('./routes/yinxiang/tag'));
router.get('/yinxiang/card/:id', lazyloadRouteHandler('./routes/yinxiang/card'));
router.get('/yinxiang/personal/:id', lazyloadRouteHandler('./routes/yinxiang/personal'));
router.get('/yinxiang/category/:id', lazyloadRouteHandler('./routes/yinxiang/category'));

// 遠見 gvm.com.tw
router.get('/gvm/index/:category?', lazyloadRouteHandler('./routes/gvm/index'));

// 触乐
router.get('/chuapp/index/:category?', lazyloadRouteHandler('./routes/chuapp/index'));

// Deloitte
router.get('/deloitte/industries/:category?', lazyloadRouteHandler('./routes/deloitte/industries'));

// 复旦大学继续教育学院
router.get('/fudan/cce', lazyloadRouteHandler('./routes/universities/fudan/cce'));

// LowEndTalk
router.get('/lowendtalk/discussion/:id?', lazyloadRouteHandler('./routes/lowendtalk/discussion'));

// 无产者评论
router.get('/proletar/:type?/:id?', lazyloadRouteHandler('./routes/proletar/index'));

// QTTabBar
router.get('/qttabbar/change-log', lazyloadRouteHandler('./routes/qttabbar/change-log'));

// 美国贸易代表办公室
router.get('/ustr/press-releases/:year?/:month?', lazyloadRouteHandler('./routes/us/ustr/press-releases'));

// 游戏动力
router.get('/vgn/:platform?', lazyloadRouteHandler('./routes/vgn/index'));

// 国际能源署
router.get('/iea/:category?', lazyloadRouteHandler('./routes/iea/index'));

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

// Semiconductor Industry Association
router.get('/semiconductors/latest-news', lazyloadRouteHandler('./routes/semiconductors/latest-news'));

// VOA News
router.get('/voa/day-photos', lazyloadRouteHandler('./routes/voa/day-photos'));

// Voice of America
router.get('/voa/:language/:channel?', lazyloadRouteHandler('./routes/voa/index'));

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

// GoComics
router.get('/gocomics/:name', lazyloadRouteHandler('./routes/gocomics/index'));

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

// Phrack Magazine
router.get('/phrack', lazyloadRouteHandler('./routes/phrack/index'));

// CQUT News
router.get('/cqut/news', lazyloadRouteHandler('./routes/universities/cqut/cqut-news'));
router.get('/cqut/libnews', lazyloadRouteHandler('./routes/universities/cqut/cqut-libnews'));

// 城农 Growin' City
router.get('/growincity/news/:id?', lazyloadRouteHandler('./routes/growincity/news'));

// Thrillist
router.get('/thrillist/:tag?', lazyloadRouteHandler('./routes/thrillist/index'));

// 丁香园
router.get('/dxy/vaccine/:province?/:city?/:location?', lazyloadRouteHandler('./routes/dxy/vaccine'));

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

// BabeHub
router.get('/babehub/search/:keyword?', lazyloadRouteHandler('./routes/babehub/search'));
router.get('/babehub/:category?', lazyloadRouteHandler('./routes/babehub/index'));

// 深圳新闻网
router.get('/sznews/press', lazyloadRouteHandler('./routes/sznews/press'));
router.get('/sznews/ranking', lazyloadRouteHandler('./routes/sznews/ranking'));

// Shuax
router.get('/shuax/project/:name?', lazyloadRouteHandler('./routes/shuax/project'));

// Obsidian
router.get('/obsidian/announcements', lazyloadRouteHandler('./routes/obsidian/announcements'));

// 吉林工商学院
router.get('/jlbtc/kyc/:category?', lazyloadRouteHandler('./routes/universities/jlbtc/kyc'));
router.get('/jlbtc/jwc/:id?', lazyloadRouteHandler('./routes/universities/jlbtc/jwc'));
router.get('/jlbtc/:category?', lazyloadRouteHandler('./routes/universities/jlbtc/index'));

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

// Hugo 更新日志
router.get('/hugo/releases', lazyloadRouteHandler('./routes/hugo/releases'));

// 东立出版
router.get('/tongli/news/:type', lazyloadRouteHandler('./routes/tongli/news'));

// OR
router.get('/or/:id?', lazyloadRouteHandler('./routes/or'));

// 字型故事
router.get('/fontstory', lazyloadRouteHandler('./routes/fontstory/tw'));

// 海南大学
router.get('/hainanu/ssszs', lazyloadRouteHandler('./routes/hainanu/ssszs'));

// 游戏年轮
router.get('/bibgame/:category?/:type?', lazyloadRouteHandler('./routes/bibgame/category'));

// 澳門特別行政區政府各公共部門獎助貸學金服務平台
router.get('/macau-bolsas/:lang?', lazyloadRouteHandler('./routes/macau-bolsas/index'));

// PotPlayer
router.get('/potplayer/update/:language?', lazyloadRouteHandler('./routes/potplayer/update'));

// 加美财经
// router.get('/caus/:category?', lazyloadRouteHandler('./routes/caus'));

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

// QuestMobile
router.get('/questmobile/report/:category?/:label?', lazyloadRouteHandler('./routes/questmobile/report'));

// Fashion Network
router.get('/fashionnetwork/news/:sectors?/:categories?/:language?', lazyloadRouteHandler('./routes/fashionnetwork/news.js'));

// dykszx
router.get('/dykszx/news/:type?', lazyloadRouteHandler('./routes/dykszx/news'));

// Fashion Network
router.get('/fashionnetwork/headline/:country?', lazyloadRouteHandler('./routes/fashionnetwork/headline.js'));

// Deprecated: DO NOT ADD ANY NEW ROUTES HERE

module.exports = router;
