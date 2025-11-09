// eslint-disable-next-line n/no-extraneous-require
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

// Benedict Evans
router.get('/benedictevans', lazyloadRouteHandler('./routes/benedictevans/recent.js'));

// Disqus
router.get('/disqus/posts/:forum', lazyloadRouteHandler('./routes/disqus/posts'));

// 极客时间
router.get('/geektime/column/:cid', lazyloadRouteHandler('./routes/geektime/column'));

// 虎牙
router.get('/huya/live/:id', lazyloadRouteHandler('./routes/huya/live'));

// f-droid
// router.get('/fdroid/apprelease/:app', lazyloadRouteHandler('./routes/fdroid/apprelease'));

// EZTV
router.get('/eztv/torrents/:imdb_id', lazyloadRouteHandler('./routes/eztv/imdb'));

// 米哈游
router.get('/mihoyo/bh3/:type', lazyloadRouteHandler('./routes/mihoyo/bh3'));
router.get('/mihoyo/bh2/:type', lazyloadRouteHandler('./routes/mihoyo/bh2'));

// 色中色
router.get('/sexinsex/:id/:type?', lazyloadRouteHandler('./routes/sexinsex/index'));

// 一个
router.get('/one', lazyloadRouteHandler('./routes/one/index'));

// Thunderbird
router.get('/thunderbird/release', lazyloadRouteHandler('./routes/thunderbird/release'));

// Hexo
router.get('/hexo/next/:url', lazyloadRouteHandler('./routes/hexo/next'));
router.get('/hexo/yilia/:url', lazyloadRouteHandler('./routes/hexo/yilia'));
router.get('/hexo/fluid/:url', lazyloadRouteHandler('./routes/hexo/fluid'));

// cpython
router.get('/cpython/:pre?', lazyloadRouteHandler('./routes/cpython'));

// 小米
// router.get('/mi/golden', lazyloadRouteHandler('./routes/mi/golden'));
// router.get('/mi/crowdfunding', lazyloadRouteHandler('./routes/mi/crowdfunding'));
// router.get('/mi/youpin/crowdfunding', lazyloadRouteHandler('./routes/mi/youpin/crowdfunding'));
// router.get('/mi/youpin/new/:sort?', lazyloadRouteHandler('./routes/mi/youpin/new'));
// router.get('/miui/:device/:type?/:region?', lazyloadRouteHandler('./routes/mi/miui/index'));

// 纵横
router.get('/zongheng/chapter/:id', lazyloadRouteHandler('./routes/zongheng/chapter'));

// 维基百科 Wikipedia
router.get('/wikipedia/mainland', lazyloadRouteHandler('./routes/wikipedia/mainland'));

// 联合国 United Nations
router.get('/un/scveto', lazyloadRouteHandler('./routes/un/scveto'));

// 选股宝
router.get('/xuangubao/subject/:subject_id', lazyloadRouteHandler('./routes/xuangubao/subject'));

// Gwern Bran­wen
router.get('/gwern/:category', lazyloadRouteHandler('./routes/gwern/category'));

// MIT Technology Review
router.get('/technologyreview', lazyloadRouteHandler('./routes/technologyreview/index'));
router.get('/technologyreview/:category_name', lazyloadRouteHandler('./routes/technologyreview/topic'));

// 腾讯视频 SDK
router.get('/qcloud/mlvb/changelog', lazyloadRouteHandler('./routes/tencent/qcloud/mlvb/changelog'));

// 腾讯吐个槽
router.get('/tucaoqq/post/:project/:key', lazyloadRouteHandler('./routes/tencent/tucaoqq/post'));

// wechat
router.get('/wechat/miniprogram/plugins', lazyloadRouteHandler('./routes/tencent/wechat/miniprogram/plugins'));

// Nvidia Web Driver
router.get('/nvidia/webdriverupdate', lazyloadRouteHandler('./routes/nvidia/webdriverupdate'));

// 马蜂窝
router.get('/mafengwo/note/:type', lazyloadRouteHandler('./routes/mafengwo/note'));
router.get('/mafengwo/ziyouxing/:code', lazyloadRouteHandler('./routes/mafengwo/ziyouxing'));

// 小说
// router.get('/novel/biquge/:id', lazyloadRouteHandler('./routes/novel/biquge'));
// router.get('/novel/biqugeinfo/:id/:limit?', lazyloadRouteHandler('./routes/novel/biqugeinfo'));
router.get('/novel/uukanshu/:uid', lazyloadRouteHandler('./routes/novel/uukanshu'));

// Gitlab
router.get('/gitlab/explore/:type/:host?', lazyloadRouteHandler('./routes/gitlab/explore'));
router.get('/gitlab/release/:namespace/:project/:host?', lazyloadRouteHandler('./routes/gitlab/release'));
router.get('/gitlab/tag/:namespace/:project/:host?', lazyloadRouteHandler('./routes/gitlab/tag'));

// 北京交通大学
router.get('/bjtu/gs/:type', lazyloadRouteHandler('./routes/universities/bjtu/gs'));

// 大连工业大学
router.get('/dpu/jiaowu/news/:type?', lazyloadRouteHandler('./routes/universities/dpu/jiaowu/news'));
router.get('/dpu/wlfw/news/:type?', lazyloadRouteHandler('./routes/universities/dpu/wlfw/news'));

// 南京工业大学
router.get('/njtech/jwc', lazyloadRouteHandler('./routes/universities/njtech/jwc'));

// 河海大学
router.get('/hhu/libNews', lazyloadRouteHandler('./routes/universities/hhu/lib-news'));
// 河海大学常州校区
router.get('/hhu/libNewsc', lazyloadRouteHandler('./routes/universities/hhu/lib-newsc'));

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
router.get('/swust/jwc/news', lazyloadRouteHandler('./routes/universities/swust/jwc-news'));
router.get('/swust/jwc/notice/:type?', lazyloadRouteHandler('./routes/universities/swust/jwc-notice'));
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
router.get('/fzu_min/:type', lazyloadRouteHandler('./routes/universities/fzu/news-min'));

// 厦门大学
router.get('/xmu/aero/:type', lazyloadRouteHandler('./routes/universities/xmu/aero'));

// 异次元软件世界
router.get('/iplay/home', lazyloadRouteHandler('./routes/iplay/home'));

// xclient.info
router.get('/xclient/app/:name', lazyloadRouteHandler('./routes/xclient/app'));

// 电影天堂
router.get('/dytt', lazyloadRouteHandler('./routes/dytt/index'));
router.get('/dytt/index', lazyloadRouteHandler('./routes/dytt/index')); // 废弃

// 趣头条
router.get('/qutoutiao/category/:cid', lazyloadRouteHandler('./routes/qutoutiao/category'));

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
router.get('/dgtle/whale/rank/:type/:rule', lazyloadRouteHandler('./routes/dgtle/whale-rank'));
router.get('/dgtle/trade/:typeId?', lazyloadRouteHandler('./routes/dgtle/trade'));
router.get('/dgtle/trade/search/:keyword', lazyloadRouteHandler('./routes/dgtle/keyword'));

// 抽屉新热榜
router.get('/chouti/top/:hour?', lazyloadRouteHandler('./routes/chouti/top'));
router.get('/chouti/:subject?', lazyloadRouteHandler('./routes/chouti'));

// 龙腾网
router.get('/ltaaa/:category?', lazyloadRouteHandler('./routes/ltaaa/index'));

// Auto Trader
router.get('/autotrader/:query', lazyloadRouteHandler('./routes/autotrader'));

// 香港天文台
router.get('/hko/weather', lazyloadRouteHandler('./routes/hko/weather'));

// gnn游戏新闻
router.get('/gnn/gnn', lazyloadRouteHandler('./routes/gnn/gnn'));

// The Guardian
router.get('/guardian/:type', lazyloadRouteHandler('./routes/guardian/guardian'));

// 下厨房
router.get('/xiachufang/user/cooked/:id', lazyloadRouteHandler('./routes/xiachufang/user/cooked'));
router.get('/xiachufang/user/created/:id', lazyloadRouteHandler('./routes/xiachufang/user/created'));
router.get('/xiachufang/popular/:timeframe?', lazyloadRouteHandler('./routes/xiachufang/popular'));

// 经济观察报
router.get('/eeo/:column?/:category?', lazyloadRouteHandler('./routes/eeo/index'));

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

// Anime1
router.get('/anime1/anime/:time/:name', lazyloadRouteHandler('./routes/anime1/anime'));
router.get('/anime1/search/:keyword', lazyloadRouteHandler('./routes/anime1/search'));

// iDownloadBlog
router.get('/idownloadblog', lazyloadRouteHandler('./routes/idownloadblog/index'));

// TesterHome
router.get('/testerhome/newest', lazyloadRouteHandler('./routes/testerhome/newest'));

// 玩物志
router.get('/coolbuy/newest', lazyloadRouteHandler('./routes/coolbuy/newest'));

// 動畫瘋
// router.get('/anigamer/new_anime', lazyloadRouteHandler('./routes/anigamer/new-anime'));
// router.get('/anigamer/anime/:sn', lazyloadRouteHandler('./routes/anigamer/anime'));

// 中国药科大学
router.get('/cpu/home', lazyloadRouteHandler('./routes/universities/cpu/home'));
router.get('/cpu/jwc', lazyloadRouteHandler('./routes/universities/cpu/jwc'));
router.get('/cpu/yjsy', lazyloadRouteHandler('./routes/universities/cpu/yjsy'));

// 字幕库
router.get('/zimuku/:type?', lazyloadRouteHandler('./routes/zimuku/index'));

// Steamgifts
router.get('/steamgifts/discussions/:category?', lazyloadRouteHandler('./routes/steam/steamgifts/discussions'));

// 扇贝
router.get('/shanbay/checkin/:id', lazyloadRouteHandler('./routes/shanbay/checkin'));
router.get('/shanbay/footprints/:category?', lazyloadRouteHandler('./routes/shanbay/footprints'));

// 停电通知
router.get('/tingdiantz/nanjing', lazyloadRouteHandler('./routes/tingdiantz/nanjing'));
router.get('/tingdiantz/95598/:province/:city/:district?', lazyloadRouteHandler('./routes/tingdiantz/95598'));

// PMCAFF
router.get('/pmcaff/list/:typeid', lazyloadRouteHandler('./routes/pmcaff/list'));
router.get('/pmcaff/feed/:typeid', lazyloadRouteHandler('./routes/pmcaff/feed'));

// icourse163
router.get('/icourse163/newest', lazyloadRouteHandler('./routes/icourse163/newest'));

// patchwork.kernel.org
router.get('/patchwork.kernel.org/comments/:id', lazyloadRouteHandler('./routes/patchwork.kernel.org/comments'));

// All Poetry
router.get('/allpoetry/:order?', lazyloadRouteHandler('./routes/allpoetry/order'));

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
// router.get('/gov/suzhou/news/:uid', lazyloadRouteHandler('./routes/gov/suzhou/news'));
// router.get('/gov/suzhou/doc', lazyloadRouteHandler('./routes/gov/suzhou/doc'));

// 山西
router.get('/gov/shanxi/rst/:category', lazyloadRouteHandler('./routes/gov/shanxi/rst'));

// 湖南
router.get('/gov/hunan/notice/:type', lazyloadRouteHandler('./routes/gov/hunan/notice'));

// 中华人民共和国国家发展和改革委员会
// router.get('/gov/ndrc/xwdt/:caty?', lazyloadRouteHandler('./routes/gov/ndrc/xwdt'));

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
// ebb
router.get('/ebb', lazyloadRouteHandler('./routes/ebb'));

// JPMorgan Chase Institute
router.get('/jpmorganchase', lazyloadRouteHandler('./routes/jpmorganchase/research'));

// 美拍
router.get('/meipai/user/:uid', lazyloadRouteHandler('./routes/meipai/user'));

// 多知网
router.get('/duozhi', lazyloadRouteHandler('./routes/duozhi'));

// 高清电台
router.get('/gaoqing/latest', lazyloadRouteHandler('./routes/gaoqing/latest'));

// Xiaomi.eu
router.get('/xiaomieu/releases', lazyloadRouteHandler('./routes/xiaomieu/releases'));

// sketch.com
router.get('/sketch/beta', lazyloadRouteHandler('./routes/sketch/beta'));
router.get('/sketch/updates', lazyloadRouteHandler('./routes/sketch/updates'));

// 每日安全
router.get('/security/pulses', lazyloadRouteHandler('./routes/security/pulses'));

// WeGene
router.get('/wegene/column/:type/:category', lazyloadRouteHandler('./routes/wegene/column'));
router.get('/wegene/newest', lazyloadRouteHandler('./routes/wegene/newest'));

// UI 中国
router.get('/ui-cn/article', lazyloadRouteHandler('./routes/ui-cn/article'));
router.get('/ui-cn/user/:id', lazyloadRouteHandler('./routes/ui-cn/user'));

// 一些博客
// 敬维-以认真的态度做完美的事情: https://jingwei.link/
router.get('/blogs/jingwei.link', lazyloadRouteHandler('./routes/blogs/jingwei-link'));

// 王垠的博客-当然我在扯淡
router.get('/blogs/wangyin', lazyloadRouteHandler('./routes/blogs/wangyin'));

// 王五四文集
router.get('/blogs/wang54/:id?', lazyloadRouteHandler('./routes/blogs/wang54'));

// WordPress
router.get('/blogs/wordpress/:domain/:https?', lazyloadRouteHandler('./routes/blogs/wordpress'));

// 親子王國
router.get('/babykingdom/:id/:order?', lazyloadRouteHandler('./routes/babykingdom'));

// 四川大学
router.get('/scu/jwc/notice', lazyloadRouteHandler('./routes/universities/scu/jwc'));
router.get('/scu/xg/notice', lazyloadRouteHandler('./routes/universities/scu/xg'));

// 浙江工商大学
router.get('/zjgsu/tzgg', lazyloadRouteHandler('./routes/universities/zjgsu/tzgg/scripts'));
router.get('/zjgsu/gsgg', lazyloadRouteHandler('./routes/universities/zjgsu/gsgg/scripts'));
router.get('/zjgsu/xszq', lazyloadRouteHandler('./routes/universities/zjgsu/xszq/scripts'));

// 半月谈
router.get('/banyuetan/byt/:time?', lazyloadRouteHandler('./routes/banyuetan/byt'));
router.get('/banyuetan/:name', lazyloadRouteHandler('./routes/banyuetan'));

// 浙江大学城市学院
router.get('/zucc/news/latest', lazyloadRouteHandler('./routes/universities/zucc/news'));
router.get('/zucc/cssearch/latest/:webVpn/:key', lazyloadRouteHandler('./routes/universities/zucc/cssearch'));

// checkee
router.get('/checkee/:dispdate', lazyloadRouteHandler('./routes/checkee/index'));

// 古诗文网
router.get('/gushiwen/recommend/:annotation?', lazyloadRouteHandler('./routes/gushiwen/recommend'));

// 北京邮电大学
router.get('/bupt/yz/:type', lazyloadRouteHandler('./routes/universities/bupt/yz'));
router.get('/bupt/grs', lazyloadRouteHandler('./routes/universities/bupt/grs'));
router.get('/bupt/portal', lazyloadRouteHandler('./routes/universities/bupt/portal'));
router.get('/bupt/news', lazyloadRouteHandler('./routes/universities/bupt/news'));
router.get('/bupt/funbox', lazyloadRouteHandler('./routes/universities/bupt/funbox'));

// 广东海洋大学
router.get('/gdoujwc', lazyloadRouteHandler('./routes/universities/gdou/jwc/jwtz'));

// Quanta Magazine
router.get('/quantamagazine/archive', lazyloadRouteHandler('./routes/quantamagazine/archive'));

// MIT
router.get('/mit/graduateadmissions/:type/:name', lazyloadRouteHandler('./routes/universities/mit/graduateadmissions'));
router.get('/mit/ocw-top', lazyloadRouteHandler('./routes/universities/mit/ocw-top'));
router.get('/mit/csail/news', lazyloadRouteHandler('./routes/universities/mit/csail/news'));

// 毕马威
router.get('/kpmg/insights', lazyloadRouteHandler('./routes/kpmg/insights'));

// 朝日新闻
router.get('/asahi/:genre?/:category?', lazyloadRouteHandler('./routes/asahi/index'));

// SoundCloud
router.get('/soundcloud/tracks/:user', lazyloadRouteHandler('./routes/soundcloud/tracks'));

// 派代
router.get('/paidai', lazyloadRouteHandler('./routes/paidai/index'));
router.get('/paidai/bbs', lazyloadRouteHandler('./routes/paidai/bbs'));
router.get('/paidai/news', lazyloadRouteHandler('./routes/paidai/news'));

// 漫画db
router.get('/manhuadb/comics/:id', lazyloadRouteHandler('./routes/manhuadb/comics'));

// 西南财经大学
router.get('/swufe/seie/:type?', lazyloadRouteHandler('./routes/universities/swufe/seie'));

// 飞地
router.get('/enclavebooks/category/:id?', lazyloadRouteHandler('./routes/enclavebooks/category'));
router.get('/enclavebooks/user/:uid', lazyloadRouteHandler('./routes/enclavebooks/user.js'));
router.get('/enclavebooks/collection/:uid', lazyloadRouteHandler('./routes/enclavebooks/collection.js'));

// 数英网最新文章
router.get('/digitaling/index', lazyloadRouteHandler('./routes/digitaling/index'));

// 数英网文章专题
router.get('/digitaling/articles/:category/:subcate?', lazyloadRouteHandler('./routes/digitaling/article'));

// 数英网项目专题
router.get('/digitaling/projects/:category', lazyloadRouteHandler('./routes/digitaling/project'));

// AlgoCasts
router.get('/algocasts', lazyloadRouteHandler('./routes/algocasts/all'));

// aqicn
router.get('/aqicn/:city/:pollution?', lazyloadRouteHandler('./routes/aqicn/index'));

// 猫眼电影
router.get('/maoyan/hot', lazyloadRouteHandler('./routes/maoyan/hot'));
router.get('/maoyan/upcoming', lazyloadRouteHandler('./routes/maoyan/upcoming'));
router.get('/maoyan/hotComplete/:orderby?/:ascOrDesc?/:top?', lazyloadRouteHandler('./routes/maoyan/hot-complete'));

// 国家退伍士兵信息
router.get('/gov/veterans/:type', lazyloadRouteHandler('./routes/gov/veterans/china'));

// 河北省退伍士兵信息
router.get('/gov/veterans/hebei/:type', lazyloadRouteHandler('./routes/gov/veterans/hebei'));

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

// AI研习社
router.get('/aiyanxishe/:id/:sort?', lazyloadRouteHandler('./routes/aiyanxishe/home'));

// 活动行
router.get('/huodongxing/explore', lazyloadRouteHandler('./routes/hdx/explore'));

// LWN.net Alerts
router.get('/lwn/alerts/:distributor', lazyloadRouteHandler('./routes/lwn/alerts'));

// 掌上英雄联盟
router.get('/lolapp/recommend', lazyloadRouteHandler('./routes/lolapp/recommend'));
router.get('/lolapp/article/:uuid', lazyloadRouteHandler('./routes/lolapp/article'));

// 左岸读书
router.get('/zreading', lazyloadRouteHandler('./routes/zreading/home'));

// 天津产权交易中心
router.get('/tprtc/cqzr', lazyloadRouteHandler('./routes/tprtc/cqzr'));
router.get('/tprtc/qyzc', lazyloadRouteHandler('./routes/tprtc/qyzc'));
router.get('/tprtc/news', lazyloadRouteHandler('./routes/tprtc/news'));

// ArchDaily
router.get('/archdaily', lazyloadRouteHandler('./routes/archdaily/home'));

// im2maker
router.get('/im2maker/:channel?', lazyloadRouteHandler('./routes/im2maker/index'));

// 巨潮资讯
router.get('/cninfo/announcement/:column/:code/:orgId/:category?/:search?', lazyloadRouteHandler('./routes/cninfo/announcement'));

// 中华人民共和国农业农村部
// router.get('/gov/moa/sjzxfb', lazyloadRouteHandler('./routes/gov/moa/sjzxfb'));
// router.get('/gov/moa/:suburl(.*)', lazyloadRouteHandler('./routes/gov/moa/moa'));

// 香水时代
router.get('/nosetime/:id/:type/:sort?', lazyloadRouteHandler('./routes/nosetime/comment'));
router.get('/nosetime/home', lazyloadRouteHandler('./routes/nosetime/home'));

// 大侠阿木
router.get('/daxiaamu/home', lazyloadRouteHandler('./routes/daxiaamu/home'));

// Simons Foundation
router.get('/simonsfoundation/articles', lazyloadRouteHandler('./routes/simonsfoundation/articles'));
router.get('/simonsfoundation/recommend', lazyloadRouteHandler('./routes/simonsfoundation/recommend'));

// 塞壬唱片
router.get('/siren/news', lazyloadRouteHandler('./routes/siren/index'));

// 学堂在线
router.get('/xuetangx/course/:cid/:type', lazyloadRouteHandler('./routes/xuetangx/course-info'));
router.get('/xuetangx/course/list/:mode/:credential/:status/:type?', lazyloadRouteHandler('./routes/xuetangx/course-list'));

// 万联网
router.get('/10000link/news/:category?', lazyloadRouteHandler('./routes/10000link/news'));

// 一兜糖
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

// 中国日报
router.get('/chinadaily/english/:category', lazyloadRouteHandler('./routes/chinadaily/english.js'));

// Hanime
router.get('/hanime/video', lazyloadRouteHandler('./routes/hanime/video'));

// Soul
router.get('/soul/:id', lazyloadRouteHandler('./routes/soul'));
router.get('/soul/posts/hot/:pid*', lazyloadRouteHandler('./routes/soul/hot'));

// 单向空间
router.get('/owspace/read/:type?', lazyloadRouteHandler('./routes/owspace/read'));

// eleme
router.get('/eleme/open/announce', lazyloadRouteHandler('./routes/eleme/open/announce'));

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

// 缺书网
router.get('/queshu/sale', lazyloadRouteHandler('./routes/queshu/sale'));
router.get('/queshu/book/:bookid', lazyloadRouteHandler('./routes/queshu/book'));

// LaTeX 开源小屋
router.get('/latexstudio/home', lazyloadRouteHandler('./routes/latexstudio/home'));

// 北华航天工业学院 - 新闻
router.get('/nciae/news', lazyloadRouteHandler('./routes/universities/nciae/news'));
// 北华航天工业学院 - 通知公告
router.get('/nciae/tzgg', lazyloadRouteHandler('./routes/universities/nciae/tzgg'));
// 北华航天工业学院 - 学术信息
router.get('/nciae/xsxx', lazyloadRouteHandler('./routes/universities/nciae/xsxx'));

// cfan
router.get('/cfan/news', lazyloadRouteHandler('./routes/cfan/news'));

// engadget
router.get('/engadget/:lang?', lazyloadRouteHandler('./routes/engadget/home'));

// leemeng
router.get('/leemeng', lazyloadRouteHandler('./routes/blogs/leemeng'));

// 中国地质大学（武汉）
router.get('/cug/graduate', lazyloadRouteHandler('./routes/universities/cug/graduate'));
router.get('/cug/undergraduate', lazyloadRouteHandler('./routes/universities/cug/undergraduate'));
router.get('/cug/xgxy', lazyloadRouteHandler('./routes/universities/cug/xgxy'));
router.get('/cug/news', lazyloadRouteHandler('./routes/universities/cug/news'));
router.get('/cug/gcxy/:type?', lazyloadRouteHandler('./routes/universities/cug/gcxy/index'));

// 米坛社区表盘
router.get('/watchface/:watch_type?/:list_type?', lazyloadRouteHandler('./routes/watchface/update'));

// CNU视觉联盟
router.get('/cnu/selected', lazyloadRouteHandler('./routes/cnu/selected'));
router.get('/cnu/discovery/:type?/:category?', lazyloadRouteHandler('./routes/cnu/discovery'));

// 知识分子
router.get('/zhishifenzi/news/:type?', lazyloadRouteHandler('./routes/zhishifenzi/news'));
router.get('/zhishifenzi/depth', lazyloadRouteHandler('./routes/zhishifenzi/depth'));
router.get('/zhishifenzi/innovation/:type?', lazyloadRouteHandler('./routes/zhishifenzi/innovation'));

// 桂林电子科技大学新闻资讯
router.get('/guet/xwzx/:type?', lazyloadRouteHandler('./routes/guet/news'));

// はてな匿名ダイアリー
router.get('/hatena/anonymous_diary/archive', lazyloadRouteHandler('./routes/hatena/anonymous_diary/archive'));

// cell [Sci Journal]
router.get('/cell/cell/:category', lazyloadRouteHandler('./routes/cell/cell/index'));
router.get('/cell/cover', lazyloadRouteHandler('./routes/cell/cover'));

// mcbbs
router.get('/mcbbs/forum/:type', lazyloadRouteHandler('./routes/mcbbs/forum'));
router.get('/mcbbs/post/:tid/:authorid?', lazyloadRouteHandler('./routes/mcbbs/post'));

// 每日猪价
// router.get('/pork-price', lazyloadRouteHandler('./routes/pork-price'));

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

// Emi Nitta official website
router.get('/emi-nitta/:type', lazyloadRouteHandler('./routes/emi-nitta/home'));

// Visual Studio Code Marketplace
router.get('/vscode/marketplace/:type?', lazyloadRouteHandler('./routes/vscode/marketplace'));

// 饭否
router.get('/fanfou/user_timeline/:uid', lazyloadRouteHandler('./routes/fanfou/user-timeline'));
router.get('/fanfou/home_timeline', lazyloadRouteHandler('./routes/fanfou/home-timeline'));
router.get('/fanfou/favorites/:uid', lazyloadRouteHandler('./routes/fanfou/favorites'));
router.get('/fanfou/trends', lazyloadRouteHandler('./routes/fanfou/trends'));
router.get('/fanfou/public_timeline/:keyword', lazyloadRouteHandler('./routes/fanfou/public-timeline'));

// Remote Work
router.get('/remote-work/:caty?', lazyloadRouteHandler('./routes/remote-work/index'));

// chocolatey
router.get('/chocolatey/software/:name?', lazyloadRouteHandler('./routes/chocolatey/software'));

// 巴哈姆特
router.get('/bahamut/creation/:author/:category?', lazyloadRouteHandler('./routes/bahamut/creation'));
router.get('/bahamut/creation_index/:category?/:subcategory?/:type?', lazyloadRouteHandler('./routes/bahamut/creation-index'));

// CentBrowser
router.get('/centbrowser/history', lazyloadRouteHandler('./routes/centbrowser/history'));

// 755
router.get('/755/user/:username', lazyloadRouteHandler('./routes/755/user'));

// Vulture
router.get('/vulture/:tag/:excludetags?', lazyloadRouteHandler('./routes/vulture/index'));

// xinwenlianbo
router.get('/xinwenlianbo/index', lazyloadRouteHandler('./routes/xinwenlianbo/index'));

// invisionapp
router.get('/invisionapp/inside-design', lazyloadRouteHandler('./routes/invisionapp/inside-design'));

// RTHK
router.get('/rthk-news/:lang/:category', lazyloadRouteHandler('./routes/rthk-news/index'));

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

// project-zero issues
router.get('/project-zero-issues', lazyloadRouteHandler('./routes/project-zero-issues/index'));

// 平安银河实验室
router.get('/galaxylab', lazyloadRouteHandler('./routes/galaxylab/index'));

// 人民日报社 国际金融报
router.get('/ifnews/:cid', lazyloadRouteHandler('./routes/ifnews/column'));

// 微信更新日志
router.get('/weixin/miniprogram/release', lazyloadRouteHandler('./routes/tencent/wechat/miniprogram/framework')); // 基础库更新日志
router.get('/weixin/miniprogram/framework', lazyloadRouteHandler('./routes/tencent/wechat/miniprogram/framework')); // 基础库更新日志
router.get('/weixin/miniprogram/devtools', lazyloadRouteHandler('./routes/tencent/wechat/miniprogram/devtools')); // 开发者工具更新日志
router.get('/weixin/miniprogram/wxcloud/:caty?', lazyloadRouteHandler('./routes/tencent/wechat/miniprogram/wxcloud')); // 云开发更新日志

// 南京林业大学教务处
router.get('/njfu/jwc/:category?', lazyloadRouteHandler('./routes/universities/njfu/jwc'));

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

// 魔法纪录
router.get('/magireco/announcements', lazyloadRouteHandler('./routes/magireco/announcements'));
router.get('/magireco/event_banner', lazyloadRouteHandler('./routes/magireco/event-banner'));

// 拉勾
router.get('/lagou/jobs/:position/:city', lazyloadRouteHandler('./routes/lagou/jobs'));

// 扬州大学
router.get('/yzu/home/:type', lazyloadRouteHandler('./routes/universities/yzu/home'));
router.get('/yzu/yjszs/:type', lazyloadRouteHandler('./routes/universities/yzu/yjszs'));

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

// 湖北工业大学
router.get('/hbut/news/:type', lazyloadRouteHandler('./routes/universities/hbut/news'));
router.get('/hbut/cs/:type', lazyloadRouteHandler('./routes/universities/hbut/cs'));

// acwifi
router.get('/acwifi', lazyloadRouteHandler('./routes/acwifi'));

// etoland
router.get('/etoland/:bo_table', lazyloadRouteHandler('./routes/etoland/board'));

// 辽宁工程技术大学教务在线公告
router.get('/lntu/jwnews', lazyloadRouteHandler('./routes/universities/lntu/jwnews'));

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

// unit-image
router.get('/unit-image/films/:type?', lazyloadRouteHandler('./routes/unit-image/films'));

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

// 广告网
router.get('/adquan/:type?', lazyloadRouteHandler('./routes/adquan/index'));

// deeplearning.ai
// router.get('/deeplearningai/thebatch', lazyloadRouteHandler('./routes/deeplearningai/thebatch'));

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

// 快媒体
router.get('/kuai', lazyloadRouteHandler('./routes/kuai/index'));
router.get('/kuai/:id', lazyloadRouteHandler('./routes/kuai/id'));

// 199it
router.get('/199it', lazyloadRouteHandler('./routes/199it/index'));
router.get('/199it/category/:caty', lazyloadRouteHandler('./routes/199it/category'));
router.get('/199it/tag/:tag', lazyloadRouteHandler('./routes/199it/tag'));

// Monotype
router.get('/monotype/article', lazyloadRouteHandler('./routes/monotype/article'));

// arXiv
router.get('/arxiv/:query', lazyloadRouteHandler('./routes/arxiv/query'));

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
// router.get('/cs/news/:caty', lazyloadRouteHandler('./routes/cs/news'));

// hentai-cosplays
router.get('/porn-images-xxx/:type?/:name?', lazyloadRouteHandler('./routes/hentai-cosplays/porn-images-xxx'));

// dcinside
router.get('/dcinside/board/:id', lazyloadRouteHandler('./routes/dcinside/board'));

// 荔枝FM
router.get('/lizhi/user/:id', lazyloadRouteHandler('./routes/lizhi/user'));

// 上海市生态环境局
router.get('/gov/shanghai/sthj', lazyloadRouteHandler('./routes/gov/shanghai/sthj'));

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

// AMD
router.get('/amd/graphicsdrivers/:id/:rid?', lazyloadRouteHandler('./routes/amd/graphicsdrivers'));

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

// 梅花网
router.get('/meihua/shots/:caty', lazyloadRouteHandler('./routes/meihua/shots'));
router.get('/meihua/article/:caty', lazyloadRouteHandler('./routes/meihua/article'));

// 看点快报
router.get('/kuaibao', lazyloadRouteHandler('./routes/kuaibao/index'));

// SocialBeta
router.get('/socialbeta/home', lazyloadRouteHandler('./routes/socialbeta/home'));

// 东方我乐多丛志
router.get('/touhougarakuta/:language/:type', lazyloadRouteHandler('./routes/touhougarakuta'));

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

// Kotaku
router.get('/kotaku/story/:type', lazyloadRouteHandler('./routes/kotaku/story'));

// 梅斯医学
router.get('/medsci/recommend', lazyloadRouteHandler('./routes/medsci/recommend'));

// 搜韵网
router.get('/souyun/today', lazyloadRouteHandler('./routes/souyun/today'));

// 中山网新闻
router.get('/zsnews/index/:cateid', lazyloadRouteHandler('./routes/zsnews/index'));

// 孔夫子旧书网
router.get('/kongfz/people/:id', lazyloadRouteHandler('./routes/kongfz/people'));
router.get('/kongfz/shop/:id/:cat?', lazyloadRouteHandler('./routes/kongfz/shop'));

// XMind
router.get('/xmind/mindmap/:lang?', lazyloadRouteHandler('./routes/xmind/mindmap'));

// 思维导图社区
router.get('/edrawsoft/mindmap/:classId?/:order?/:sort?/:lang?/:price?/:search?', lazyloadRouteHandler('./routes/edrawsoft/mindmap'));

// hentaimama
router.get('/hentaimama/videos', lazyloadRouteHandler('./routes/hentaimama/videos'));

// 无讼
router.get('/itslaw/judgements/:conditions', lazyloadRouteHandler('./routes/itslaw/judgements'));

// 文学城
router.get('/wenxuecity/blog/:id', lazyloadRouteHandler('./routes/wenxuecity/blog'));
router.get('/wenxuecity/bbs/:cat/:elite?', lazyloadRouteHandler('./routes/wenxuecity/bbs'));
router.get('/wenxuecity/hot/:cid', lazyloadRouteHandler('./routes/wenxuecity/hot'));
router.get('/wenxuecity/news', lazyloadRouteHandler('./routes/wenxuecity/news'));

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

// 互动吧
router.get('/hudongba/:city/:id', lazyloadRouteHandler('./routes/hudongba/index'));

// 1X
router.get('/1x/:category?', lazyloadRouteHandler('./routes/1x/index'));

// 剑网3
router.get('/jx3/:caty?', lazyloadRouteHandler('./routes/jx3/news'));

// 泉州市跨境电子商务协会
router.get('/qzcea/:caty?', lazyloadRouteHandler('./routes/qzcea/index'));

// CGTN
router.get('/cgtn/most/:type?/:time?', lazyloadRouteHandler('./routes/cgtn/most'));
router.get('/cgtn/opinions', lazyloadRouteHandler('./routes/cgtn/opinions'));

// AppSales
router.get('/appsales/:caty?/:time?', lazyloadRouteHandler('./routes/appsales/index'));

// iCity
router.get('/icity/:id', lazyloadRouteHandler('./routes/icity/index'));

// ABC News
// router.get('/abc/:id?', lazyloadRouteHandler('./routes/abc'));

// 妈咪帮
router.get('/mamibuy/:caty?/:age?/:sort?', lazyloadRouteHandler('./routes/mamibuy/index'));

// Nobel Prize
router.get('/nobelprize/:caty?', lazyloadRouteHandler('./routes/nobelprize/index'));

// 中華民國國防部
router.get('/gov/taiwan/mnd', lazyloadRouteHandler('./routes/gov/taiwan/mnd'));

// 中国人大网
// router.get('/npc/:caty', lazyloadRouteHandler('./routes/npc/index'));

// 高科技行业门户
router.get('/ofweek/news', lazyloadRouteHandler('./routes/ofweek/news'));

// World Trade Organization
router.get('/wto/dispute-settlement/:year?', lazyloadRouteHandler('./routes/wto/dispute-settlement'));

// 4399论坛
router.get('/forum4399/:mtag', lazyloadRouteHandler('./routes/game4399/forum'));

// 国防科技大学
router.get('/nudt/yjszs/:id?', lazyloadRouteHandler('./routes/universities/nudt/yjszs'));

// GameRes 游资网
router.get('/gameres/hot', lazyloadRouteHandler('./routes/gameres/hot'));
router.get('/gameres/list/:id', lazyloadRouteHandler('./routes/gameres/list'));

// ManicTime
router.get('/manictime/releases', lazyloadRouteHandler('./routes/manictime/releases'));

// Deutsche Welle 德国之声
router.get('/dw/:lang?/:caty?', lazyloadRouteHandler('./routes/dw/index'));

// Citavi 中文网站论坛
router.get('/citavi/:caty?', lazyloadRouteHandler('./routes/citavi/index'));

// Sesame
router.get('/sesame/release_notes', lazyloadRouteHandler('./routes/sesame/release-notes'));

// QNAP
router.get('/qnap/release-notes/:id', lazyloadRouteHandler('./routes/qnap/release-notes'));

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
router.get('/us/supremecourt/argument_audio/:year?', lazyloadRouteHandler('./routes/us/supremecourt/argument-audio'));

// 优设网
router.get('/uisdc/hangye/:caty?', lazyloadRouteHandler('./routes/uisdc/hangye'));

// 美国中央情报局
router.get('/cia/foia-annual-report', lazyloadRouteHandler('./routes/us/cia/foia-annual-report'));

// Everything
router.get('/everything/changes', lazyloadRouteHandler('./routes/everything/changes'));

// 中国劳工通讯
router.get('/clb/commentary/:lang?', lazyloadRouteHandler('./routes/clb/commentary'));

// 超理论坛
router.get('/chaoli/:channel?', lazyloadRouteHandler('./routes/chaoli/index'));

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

// 生命时报
router.get('/lifetimes/:category?', lazyloadRouteHandler('./routes/lifetimes/index'));

// Zhimap 知识导图社区
router.get('/zhimap/:categoryUuid?/:recommend?', lazyloadRouteHandler('./routes/zhimap/index'));

// Mathpix
router.get('/mathpix/blog', lazyloadRouteHandler('./routes/mathpix/blog'));

// OneNote Gem Add-Ins
router.get('/onenotegem/release', lazyloadRouteHandler('./routes/onenotegem/release'));

// 幕布网
router.get('/mubu/explore/:category?/:title?', lazyloadRouteHandler('./routes/mubu/explore'));

// 有道云笔记
router.get('/youdao/xueba', lazyloadRouteHandler('./routes/youdao/xueba'));
router.get('/youdao/latest', lazyloadRouteHandler('./routes/youdao/latest'));

// 印象识堂
router.get('/yinxiang/note', lazyloadRouteHandler('./routes/yinxiang/note'));
router.get('/yinxiang/tag/:id', lazyloadRouteHandler('./routes/yinxiang/tag'));
router.get('/yinxiang/card/:id', lazyloadRouteHandler('./routes/yinxiang/card'));
router.get('/yinxiang/personal/:id', lazyloadRouteHandler('./routes/yinxiang/personal'));
router.get('/yinxiang/category/:id', lazyloadRouteHandler('./routes/yinxiang/category'));

// 触乐
router.get('/chuapp/index/:category?', lazyloadRouteHandler('./routes/chuapp/index'));

// Deloitte
router.get('/deloitte/industries/:category?', lazyloadRouteHandler('./routes/deloitte/industries'));

// 复旦大学继续教育学院
router.get('/fudan/cce', lazyloadRouteHandler('./routes/universities/fudan/cce'));

// 无产者评论
router.get('/proletar/:type?/:id?', lazyloadRouteHandler('./routes/proletar/index'));

// QTTabBar
router.get('/qttabbar/change-log', lazyloadRouteHandler('./routes/qttabbar/change-log'));

// 美国贸易代表办公室
router.get('/ustr/press-releases/:year?/:month?', lazyloadRouteHandler('./routes/us/ustr/press-releases'));

// 游戏动力
router.get('/vgn/:platform?', lazyloadRouteHandler('./routes/vgn/index'));

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

// 有趣天文奇观
router.get('/interesting-sky/astronomical_events/:year?', lazyloadRouteHandler('./routes/interesting-sky/astronomical-events'));
router.get('/interesting-sky/recent-interesting', lazyloadRouteHandler('./routes/interesting-sky/recent-interesting'));
router.get('/interesting-sky', lazyloadRouteHandler('./routes/interesting-sky/index'));

// 国际数学联合会
router.get('/mathunion/fields-medal', lazyloadRouteHandler('./routes/mathunion/fields-medal'));

// ACM
router.get('/acm/amturingaward', lazyloadRouteHandler('./routes/acm/amturingaward'));

// 滴答清单
router.get('/dida365/habit/checkins', lazyloadRouteHandler('./routes/dida365/habit-checkins'));

// Ditto clipboard manager
router.get('/ditto/changes/:type?', lazyloadRouteHandler('./routes/ditto/changes'));

// Oak Ridge National Laboratory
router.get('/ornl/news', lazyloadRouteHandler('./routes/ornl/news'));

// 信阳师范学院 自考办
router.get('/xynu/zkb/:category', lazyloadRouteHandler('./routes/universities/xynu/zkb'));

// DailyArt
router.get('/dailyart/:language?', lazyloadRouteHandler('./routes/dailyart/index'));

// 猿料
router.get('/yuanliao/:tag?/:sort?', lazyloadRouteHandler('./routes/yuanliao/index'));

// 中国政协网
router.get('/cppcc/:slug?', lazyloadRouteHandler('./routes/gov/cppcc/index'));

// National Association of Colleges and Employers
router.get('/nace/blog/:sort?', lazyloadRouteHandler('./routes/nace/blog'));

// Semiconductor Industry Association
router.get('/semiconductors/latest-news', lazyloadRouteHandler('./routes/semiconductors/latest-news'));

// Voice of America
router.get('/voa/:language/:channel?', lazyloadRouteHandler('./routes/voa/index'));

// 阳光高考
router.get('/chsi/zszcgd/:category?', lazyloadRouteHandler('./routes/chsi/zszcgd'));

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

// Gab
router.get('/gab/user/:username', lazyloadRouteHandler('./routes/gab/user'));

// Phrack Magazine
router.get('/phrack', lazyloadRouteHandler('./routes/phrack/index'));

// CQUT News
router.get('/cqut/news', lazyloadRouteHandler('./routes/universities/cqut/cqut-news'));
router.get('/cqut/libnews', lazyloadRouteHandler('./routes/universities/cqut/cqut-libnews'));

// 城农 Growin' City
router.get('/growincity/news/:id?', lazyloadRouteHandler('./routes/growincity/news'));

// 中国庭审公开网
router.get('/tingshen', lazyloadRouteHandler('./routes/tingshen/tingshen'));

// 中华人民共和国人力资源和社会保障部
router.get('/gov/mohrss/sbjm/:category?', lazyloadRouteHandler('./routes/gov/mohrss/sbjm'));

// 天眼查
router.get('/tianyancha/hot', lazyloadRouteHandler('./routes/tianyancha/hot'));

// King Arthur
router.get('/kingarthur/:type', lazyloadRouteHandler('./routes/kingarthur/index'));

// 深圳新闻网
router.get('/sznews/press', lazyloadRouteHandler('./routes/sznews/press'));
router.get('/sznews/ranking', lazyloadRouteHandler('./routes/sznews/ranking'));

// 吉林工商学院
router.get('/jlbtc/kyc/:category?', lazyloadRouteHandler('./routes/universities/jlbtc/kyc'));
router.get('/jlbtc/jwc/:id?', lazyloadRouteHandler('./routes/universities/jlbtc/jwc'));
router.get('/jlbtc/:category?', lazyloadRouteHandler('./routes/universities/jlbtc/index'));

// 劍心．回憶
router.get('/kenshin/:category?/:type?', lazyloadRouteHandler('./routes/kenshin/index'));

// av01
router.get('/av01/actor/:name/:type?', lazyloadRouteHandler('./routes/av01/actor'));
router.get('/av01/tag/:name/:type?', lazyloadRouteHandler('./routes/av01/tag'));

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
router.get('/furaffinity/submission_comments/:id', lazyloadRouteHandler('./routes/furaffinity/submission-comments'));
router.get('/furaffinity/journal_comments/:id', lazyloadRouteHandler('./routes/furaffinity/journal-comments'));

// Trakt.tv
router.get('/trakt/collection/:username/:type?', lazyloadRouteHandler('./routes/trakt/collection'));

// 全球化智库
router.get('/ccg/:category?', lazyloadRouteHandler('./routes/ccg/index'));

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

// 海南大学
router.get('/hainanu/ssszs', lazyloadRouteHandler('./routes/hainanu/ssszs'));

// 游戏年轮
router.get('/bibgame/:category?/:type?', lazyloadRouteHandler('./routes/bibgame/category'));

// PotPlayer
router.get('/potplayer/update/:language?', lazyloadRouteHandler('./routes/potplayer/update'));

// 人民论坛网
router.get('/rmlt/idea/:category?', lazyloadRouteHandler('./routes/rmlt/idea'));

// CBNData
router.get('/cbndata/information/:category?', lazyloadRouteHandler('./routes/cbndata/information'));

// TANC 艺术新闻
router.get('/tanchinese/:category?', lazyloadRouteHandler('./routes/tanchinese'));

// yuzu emulator
router.get('/yuzu-emu/entry', lazyloadRouteHandler('./routes/yuzu-emu/entry'));

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

// 香港討論區
router.get('/discuss/:fid', lazyloadRouteHandler('./routes/discuss'));

// Uwants
router.get('/uwants/:fid', lazyloadRouteHandler('./routes/uwants'));

// Now新聞
router.get('/now/news/rank', lazyloadRouteHandler('./routes/now/rank'));

// etherscan
router.get('/etherscan/transactions/:address', lazyloadRouteHandler('./routes/etherscan/transactions'));

// foreverblog
router.get('/blogs/foreverblog', lazyloadRouteHandler('./routes/blogs/foreverblog'));

// Fashion Network
router.get('/fashionnetwork/news/:sectors?/:categories?/:language?', lazyloadRouteHandler('./routes/fashionnetwork/news.js'));

// dykszx
router.get('/dykszx/news/:type?', lazyloadRouteHandler('./routes/dykszx/news'));

// Fashion Network
router.get('/fashionnetwork/headline/:country?', lazyloadRouteHandler('./routes/fashionnetwork/headline.js'));

// Deprecated: DO NOT ADD ANY NEW ROUTES HERE

module.exports = router;
