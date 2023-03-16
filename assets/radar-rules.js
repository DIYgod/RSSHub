({
    // '8world.com': { _name: '8视界', '.': [{ title: '分类', docs: 'https://docs.rsshub.app/new-media.html#_8-shi-jie-fen-lei', source: ['/:category', '/'], target: '/8world/:category?' }] },
    'aamacau.com': { _name: '論盡媒體 AllAboutMacau Media', '.': [{ title: '话题', docs: 'https://docs.rsshub.app/new-media.html#lun-jin-mei-ti-allaboutmacau-media-hua-ti', source: ['/'], target: '/:category?/:id?' }] },
    'eprice.com.tw': { _name: 'ePrice', '.': [{ title: 'ePrice 比價王', docs: 'https://docs.rsshub.app/new-media.html#eprice', source: ['/'], target: '/:region?' }] },
    'eprice.com.hk': { _name: 'ePrice', '.': [{ title: 'ePrice 香港', docs: 'https://docs.rsshub.app/new-media.html#eprice', source: ['/'], target: '/:region?' }] },
    'furstar.jp': {
        _name: 'Furstar',
        '.': [
            { title: '最新售卖角色列表', docs: 'https://docs.rsshub.app/shopping.html#furstar-zui-xin-shou-mai-jiao-se-lie-biao', source: ['/:lang', '/'], target: '/furstar/characters/:lang' },
            { title: '已经出售的角色列表', docs: 'https://docs.rsshub.app/shopping.html#furstar-yi-jing-chu-shou-de-jiao-se-lie-biao', source: ['/:lang/archive.php', '/archive.php'], target: '/furstar/archive/:lang' },
            { title: '画师列表', docs: 'https://docs.rsshub.app/shopping.html#furstar-hua-shi-lie-biao', source: ['/'], target: '/furstar/artists' },
        ],
    },
    'https://www.icac.org.hk': { _name: '廉政公署', '.': [{ title: '新闻公布', docs: 'https://docs.rsshub.app/government.html#xiang-gang-lian-zheng-gong-shu', source: ['/:lang/press/index.html'], target: '/icac/news/:lang' }] },
    'trow.cc': { _name: 'The Ring of Wonder', '.': [{ title: '首页更新', docs: 'https://docs.rsshub.app/bbs.html#the-ring-of-wonder', source: ['/'], target: '/portal' }] },
    'github.com': {
        _name: 'GitHub',
        '.': [
            { title: '用户仓库', docs: 'https://docs.rsshub.app/programming.html#github', source: '/:user', target: '/github/repos/:user' },
            { title: '用户 Followers', docs: 'https://docs.rsshub.app/programming.html#github', source: '/:user', target: '/github/user/followers/:user' },
            { title: 'Trending', docs: 'https://docs.rsshub.app/programming.html#github', source: '/trending', target: '/github/trending/:since' },
            { title: 'Trending', docs: 'https://docs.rsshub.app/programming.html#github', source: '/topics', target: '/github/topics/:name/:qs?' },
            { title: '仓库 Issue', docs: 'https://docs.rsshub.app/programming.html#github', source: ['/:user/:repo/issues', '/:user/:repo/issues/:id', '/:user/:repo'], target: '/github/issue/:user/:repo' },
            { title: '仓库 Pull Requests', docs: 'https://docs.rsshub.app/programming.html#github', source: ['/:user/:repo/pulls', '/:user/:repo/pulls/:id', '/:user/:repo'], target: '/github/pull/:user/:repo' },
            { title: '仓库 Stars', docs: 'https://docs.rsshub.app/programming.html#github', source: ['/:user/:repo/stargazers', '/:user/:repo'], target: '/github/stars/:user/:repo' },
            { title: '仓库 Branches', docs: 'https://docs.rsshub.app/programming.html#github', source: ['/:user/:repo/branches', '/:user/:repo'], target: '/github/branches/:user/:repo' },
            { title: '文件 Commits', docs: 'https://docs.rsshub.app/programming.html#github', source: '/:user/:repo/blob/:branch/*filepath', target: '/github/file/:user/:repo/:branch/:filepath' },
            { title: '用户 Starred Repositories', docs: 'https://docs.rsshub.app/programming.html#github', source: '/:user', target: '/github/starred_repos/:user' },
            { title: '仓库 Contributors', docs: 'https://docs.rsshub.app/programming.html#github', source: ['/:user/:repo/graphs/contributors', '/:user/:repo'], target: '/github/contributors/:user/:repo' },
        ],
    },
    'ximalaya.com': {
        _name: '喜马拉雅',
        '.': [
            {
                title: '专辑',
                docs: 'https://docs.rsshub.app/multimedia.html#xi-ma-la-ya',
                source: '/:type/:id',
                target: (params) => {
                    if (parseInt(params.id) + '' === params.id) {
                        return '/ximalaya/:type/:id/';
                    }
                },
            },
        ],
    },
    'algocasts.io': { _name: 'AlgoCasts', '.': [{ title: '视频更新', docs: 'https://docs.rsshub.app/programming.html#algocasts', source: '/episodes', target: '/algocasts' }] },
    'soulapp.cn': { _name: 'Soul', '.': [{ title: '瞬间更新', docs: 'https://docs.rsshub.app/social-media.html#soul' }] },
    'anime1.me': {
        _name: 'Anime1',
        '.': [
            { title: '動畫', docs: 'https://docs.rsshub.app/anime.html#anime1', source: '/category/:time/:name', target: '/anime1/anime/:time/:name' },
            {
                title: '搜尋',
                docs: 'https://docs.rsshub.app/anime.html#anime1',
                source: '/',
                target: (params, url) => {
                    const keyword = new URL(url).searchParams.get('s');
                    return keyword ? `/anime1/search/${keyword}` : '';
                },
            },
        ],
    },
    'swufe.edu.cn': {
        _name: '西南财经大学',
        it: [
            { title: '经济信息工程学院 - 通知公告', docs: 'https://docs.rsshub.app/university.html#xi-nan-cai-jing-da-xue', source: '/index/tzgg.htm', target: '/swufe/seie/tzgg' },
            { title: '经济信息工程学院 - 学院新闻', docs: 'https://docs.rsshub.app/university.html#xi-nan-cai-jing-da-xue', source: '/index/xyxw.htm', target: '/swufe/seie/xyxw' },
        ],
    },
    'ishuhui.com': { _name: '鼠绘漫画', www: [{ title: '鼠绘漫画', docs: 'https://docs.rsshub.app/anime.html#shu-hui-man-hua', source: '/comics/anime/:id', target: '/shuhui/comics/:id' }] },
    'www.chicagotribune.com': { _name: 'Chicago Tribune', www: [{ title: 'Chicago Tribune', docs: 'https://docs.rsshub.app/traditional_media.html#chicago-tribune', source: '/' }] },
    'haimaoba.com': { _name: '海猫吧', www: [{ title: '漫画更新', docs: 'https://docs.rsshub.app/anime.html#hai-mao-ba', source: '/catalog/:id', target: '/haimaoba/:id' }] },
    'pgyer.com': { _name: '蒲公英应用分发', www: [{ title: 'app更新', docs: 'https://docs.rsshub.app/program-update.html#pu-gong-ying-ying-yong-fen-fa', source: '/:app', target: '/pgyer/:app' }] },
    'wineyun.com': { _name: '酒云网', www: [{ title: '最新商品', docs: 'https://docs.rsshub.app/other.html#jiu-yun-wang', source: ['/:category'], target: '/wineyun/:category' }] },
    'epicgames.com': { _name: 'Epic Games', www: [{ title: '每周免费游戏', docs: 'https://docs.rsshub.app/game.html#epicgames-freegame', source: '/store/zh-CN/free-games', target: '/epicgames/freegames' }] },
    'playstation.com': {
        _name: 'PlayStation',
        store: [
            { title: '游戏列表', docs: 'https://docs.rsshub.app/game.html#playstation', source: '/zh-hans-hk/grid/:id/:page', target: '/ps/list/:id' },
            { title: '折扣|价格', docs: 'https://docs.rsshub.app/game.html#playstation', source: ['/:lang/product/:gridName'], target: '/ps/:lang/product/:gridName' },
        ],
        www: [
            { title: '用户奖杯', docs: 'https://docs.rsshub.app/game.html#playstation' },
            { title: '系统更新纪录', docs: 'https://docs.rsshub.app/game.html#playstation' },
        ],
    },
    'monsterhunter.com': {
        _name: '怪物猎人世界',
        www: [
            { title: '更新情报', docs: 'https://docs.rsshub.app/game.html#guai-wu-lie-ren-shi-jie', source: ['', '/*tpath'], target: '/mhw/update' },
            { title: '最新消息', docs: 'https://docs.rsshub.app/game.html#guai-wu-lie-ren-shi-jie', source: ['', '/*tpath'], target: '/mhw/news' },
        ],
    },
    'vgtime.com': {
        _name: '游戏时光',
        www: [
            { title: '新闻', docs: 'https://docs.rsshub.app/game.html#you-xi-shi-guang', source: '/topic/index.jhtml', target: '/vgtime/news' },
            { title: '游戏发售表', docs: 'https://docs.rsshub.app/game.html#you-xi-shi-guang', source: '/game/release.jhtml', target: '/vgtime/release' },
            { title: '关键词资讯', docs: 'https://docs.rsshub.app/game.html#you-xi-shi-guang', source: '/search/list.jhtml', target: (params, url) => `/vgtime/keyword/${new URL(url).searchParams.get('keyword')}` },
        ],
    },
    'bing.com': { _name: 'Bing', www: [{ title: '每日壁纸', docs: 'https://docs.rsshub.app/picture.html#bing-bi-zhi', source: '', target: '/bing' }] },
    'wegene.com': {
        _name: 'WeGene',
        www: [
            { title: '最近更新', docs: 'https://docs.rsshub.app/other.html#wegene', source: '', target: '/wegene/newest' },
            { title: '栏目', docs: 'https://docs.rsshub.app/other.html#wegene', source: '/crowdsourcing', target: '/wegene/column/all/all' },
        ],
    },
    '3ycy.com': { _name: '三界异次元', www: [{ title: '最近更新', docs: 'https://docs.rsshub.app/anime.html#san-jie-yi-ci-yuan', source: '/', target: '/3ycy/home' }] },
    'emi-nitta.net': {
        _name: 'Emi Nitta',
        '.': [
            { title: '最近更新', docs: 'https://docs.rsshub.app/other.html#xin-tian-hui-hai-guan-fang-wang-zhan', source: '/updates', target: '/emi-nitta/updates' },
            { title: '新闻', docs: 'https://docs.rsshub.app/other.html#xin-tian-hui-hai-guan-fang-wang-zhan', source: '/contents/news', target: '/emi-nitta/news' },
        ],
    },
    'alter-shanghai.cn': { _name: 'Alter', '.': [{ title: '新闻', docs: 'https://docs.rsshub.app/shopping.html#alter-zhong-guo', source: '/cn/news.html', target: '/alter-cn/news' }] },
    'itslide.com': { _name: 'ITSlide', www: [{ title: '最新', docs: 'https://docs.rsshub.app/programming.html#itslide', source: '/*', target: '/itslide/new' }] },
    'leboncoin.fr': { _name: 'leboncoin', www: [{ title: 'ads', docs: 'https://docs.rsshub.app/en/shopping.html#leboncoin', source: '/recherche', target: (params, url) => '/leboncoin/ad/' + url.split('?')[1] }] },
    'yuancheng.work': {
        _name: '远程.work',
        '.': [
            {
                title: '招聘信息',
                docs: 'https://docs.rsshub.app/other.html#yuan-cheng-work',
                source: '/:caty',
                target: (params, url) => {
                    if (!url) {
                        return '/remote-work';
                    }
                    return '/remote-work/' + /\w+-(\w+)-\w+/.exec(url)[1];
                },
            },
        ],
    },
    'chinatimes.com': { _name: '中時電子報', www: [{ title: '新聞', docs: 'https://docs.rsshub.app/traditional-media.html#zhong-shi-dian-zi-bao', source: '/:caty', target: (params) => '/chinatimes/' + params.caty }] },
    'ithome.com': {
        _name: 'IT 之家',
        '.': [
            { title: '24 小时阅读榜', docs: 'https://docs.rsshub.app/new-media.html#it-zhi-jia', source: ['', '/*'], target: '/ithome/ranking/24h' },
            { title: '7 天最热', docs: 'https://docs.rsshub.app/new-media.html#it-zhi-jia', source: ['', '/*'], target: '/ithome/ranking/7days' },
            { title: '月榜', docs: 'https://docs.rsshub.app/new-media.html#it-zhi-jia', source: ['', '/*'], target: '/ithome/ranking/monthly' },
        ],
        it: [{ title: 'IT 资讯', docs: 'https://docs.rsshub.app/new-media.html#it-zhi-jia', source: '/', target: '/ithome/it' }],
        soft: [{ title: '软件之家', docs: 'https://docs.rsshub.app/new-media.html#it-zhi-jia', source: '/', target: '/ithome/soft' }],
        win10: [{ title: 'win10 之家', docs: 'https://docs.rsshub.app/new-media.html#it-zhi-jia', source: '/', target: '/ithome/win10' }],
        iphone: [{ title: 'iphone 之家', docs: 'https://docs.rsshub.app/new-media.html#it-zhi-jia', source: '/', target: '/ithome/iphone' }],
        ipad: [{ title: 'ipad 之家', docs: 'https://docs.rsshub.app/new-media.html#it-zhi-jia', source: '/', target: '/ithome/ipad' }],
        android: [{ title: 'android 之家', docs: 'https://docs.rsshub.app/new-media.html#it-zhi-jia', source: '/', target: '/ithome/android' }],
        digi: [{ title: '数码之家', docs: 'https://docs.rsshub.app/new-media.html#it-zhi-jia', source: '/', target: '/ithome/digi' }],
        next: [{ title: '智能时代', docs: 'https://docs.rsshub.app/new-media.html#it-zhi-jia', source: '/', target: '/ithome/next' }],
    },
    'govopendata.com': { _name: '新闻联播文字版', cn: [{ title: '新闻联播文字版', docs: 'https://docs.rsshub.app/traditional-media.html#xin-wen-lian-bo-wen-zi-ban', source: '/xinwenlianbo', target: '/xinwenlianbo/index' }] },
    'steampowered.com': { _name: 'Steam', store: [{ title: 'search', docs: 'https://docs.rsshub.app/game.html#steam', source: '/search/', target: (params, url) => `/steam/search/${new URL(url).searchParams}` }] },
    // 'baijingapp.com': { _name: '白鲸出海', www: [{ title: '文章', docs: 'https://docs.rsshub.app/new-media.html#bai-jing-chu-hai', source: '', target: '/baijing' }] },
    'xiaomi.cn': { _name: '小米社区', www: [{ title: '圈子', docs: 'https://docs.rsshub.app/bbs.html#xiao-mi-she-qu', source: '/board/:boardId', target: '/mi/bbs/board/:boardId' }] },
    'suzhou.gov.cn': { _name: '苏州市政府', www: [{ title: '政府新闻', docs: 'https://docs.rsshub.app/government.html#su-zhou-shi-ren-min-zheng-fu', source: '/szsrmzf/:uid/nav_list.shtml', target: '/gov/suzhou/news/:uid' }] },
    'mqube.net': {
        _name: 'MQube',
        www: [
            { title: '全站最近更新', docs: 'https://docs.rsshub.app/multimedia.html#mqube', source: '/', target: '/mqube/latest' },
            { title: '全站每日排行', docs: 'https://docs.rsshub.app/multimedia.html#mqube', source: '/', target: '/mqube/top' },
            { title: '个人最近更新', docs: 'https://docs.rsshub.app/multimedia.html#mqube', source: '/user/:user', target: '/mqube/user/:user' },
            { title: '标签最近更新', docs: 'https://docs.rsshub.app/multimedia.html#mqube', source: '/search/tag/:tag', target: '/mqube/tag/:tag' },
        ],
    },
    'last.fm': {
        _name: 'Last.fm',
        www: [
            { title: '用户播放记录', docs: 'https://docs.rsshub.app/multimedia.html#last-fm', source: ['/user/:user', '/user/:user/*'], target: '/lastfm/recent/:user' },
            { title: '用户 Love 记录', docs: 'https://docs.rsshub.app/multimedia.html#last-fm', source: ['/user/:user', '/user/:user/*'], target: '/lastfm/loved/:user' },
            { title: '站内 Top 榜单', docs: 'https://docs.rsshub.app/multimedia.html#last-fm', source: '/charts', target: '/lastfm/top' },
        ],
    },
    'ddrk.me': {
        _name: '低端影视',
        www: [
            { title: '首页', docs: 'https://docs.rsshub.app/multimedia.html#di-duan-ying-shi', source: '/', target: '/ddrk/index' },
            { title: '标签', docs: 'https://docs.rsshub.app/multimedia.html#di-duan-ying-shi', source: '/tag/:tag', target: '/ddrk/tag/:tag' },
            { title: '分类', docs: 'https://docs.rsshub.app/multimedia.html#di-duan-ying-shi', source: ['/category/:category', '/category/:uplevel/:category'], target: '/ddrk/category/:category' },
            {
                title: '影视剧集更新',
                docs: 'https://docs.rsshub.app/multimedia.html#di-duan-ying-shi',
                source: ['/:name', '/:name/:season'],
                target: (params) => {
                    if (params.name !== 'category' && params.name !== 'tag' && params.name !== 'ddrklogin' && params.name !== 'about' && params.name !== 'deleted') {
                        return `/ddrk/update/${params.name}${params.season ? '/' + params.season : ''}`;
                    }
                },
            },
        ],
    },
    'google.com': {
        _name: '谷歌',
        photos: [
            {
                title: '相册',
                docs: 'https://docs.rsshub.app/picture.html#google-xiang-ce',
                source: '/share/*',
                target: (params, url, document) => {
                    const id = document && document.querySelector('html').innerHTML.match(/photos.app.goo.gl\/(.*?)"/)[1];
                    return id ? `/google/album/${id}` : '';
                },
            },
        ],
        sites: [{ title: 'Sites', docs: 'https://docs.rsshub.app/blog.html#google-sites', source: ['/site/:id/*', '/site/:id'], target: '/google/sites/:id' }],
    },
    'hackerone.com': { _name: 'HackerOne', '.': [{ title: 'HackerOne Hacker Activity', docs: 'https://docs.rsshub.app/other.html#hackerone-hacker-activity', source: '/hacktivity', target: '/hackerone/hacktivity' }] },
    'cowlevel.net': { _name: '奶牛关', '.': [{ title: '元素文章', docs: 'https://docs.rsshub.app/game.html#nai-niu-guan', source: ['/element/:id', '/element/:id/article'], target: '/cowlevel/element/:id' }] },
    'beijing.gov.cn': { wjw: [{ title: '北京卫生健康委员会', docs: 'https://docs.rsshub.app/government.html#bei-jing-shi-wei-sheng-jian-kang-wei-yuan-hui', source: '/xwzx_20031/:caty', target: '/gov/beijing/mhc/:caty' }] },
    'ynu.edu.cn': {
        _name: '云南大学',
        home: [{ title: '官网消息通告', docs: 'https://docs.rsshub.app/university.html#yun-nan-da-xue', source: '/tzgg.htm', target: '/ynu/home' }],
        jwc: [
            { title: '教务处教务科通知', docs: 'https://docs.rsshub.app/university.html#yun-nan-da-xue', source: '/*', target: '/jwc/1' },
            { title: '教务处学籍科通知', docs: 'https://docs.rsshub.app/university.html#yun-nan-da-xue', source: '/*', target: '/jwc/2' },
            { title: '教务处教学研究科通知', docs: 'https://docs.rsshub.app/university.html#yun-nan-da-xue', source: '/*', target: '/jwc/3' },
            { title: '教务处实践科学科通知', docs: 'https://docs.rsshub.app/university.html#yun-nan-da-xue', source: '/*', target: '/jwc/4' },
        ],
        grs: [{ title: '研究生院通知', docs: 'https://docs.rsshub.app/university.html#yun-nan-da-xue', source: '/*', target: '' }],
    },
    'japanpost.jp': {
        _name: '日本郵便',
        'trackings.post': [
            {
                title: '郵便・荷物の追跡',
                docs: 'https://docs.rsshub.app/other.html#ri-ben-you-bian-you-bian-zhui-ji-サービス',
                source: '/services/srv/search/direct',
                target: (params, url) => {
                    const reqCode = new URL(url).searchParams.get('reqCodeNo1').toUpperCase();
                    const locale = new URL(url).searchParams.get('locale').toLowerCase();
                    if ((reqCode.search(/^(?:\d{11,12}|[A-Z]{2}\d{9}[A-Z]{2})$/) === 0 && locale === 'ja') || locale === 'en') {
                        return `/japanpost/track/${reqCode}/${locale}`;
                    }
                },
            },
        ],
    },
    // 'biquge5200.com': { www: [{ title: 'biquge5200.com', docs: 'https://docs.rsshub.app/reading.html#bi-qu-ge-biquge5200-com', source: '/:id', target: '/novel/biquge/:id' }] },
    // 'biquge.info': { www: [{ title: 'biquge.info', docs: 'https://docs.rsshub.app/reading.html#bi-qu-ge-biquge-info', source: '/:id', target: '/novel/biqugeinfo/:id' }] },
    'matters.news': {
        _name: 'Matters',
        '.': [
            { title: '最新排序', docs: 'https://docs.rsshub.app/new-media.html#matters', source: '', target: '/matters/latest' },
            { title: '标签', docs: 'https://docs.rsshub.app/new-media.html#matters', source: '/tags/:tid', target: '/matters/tags/:tid' },
            {
                title: '作者',
                docs: 'https://docs.rsshub.app/new-media.html#matters',
                source: ['/:id', '/:id/comments'],
                target: (params) => {
                    const uid = params.id.replace('@', '');
                    return uid ? `/matters/author/${uid}` : '';
                },
            },
        ],
    },
    'zhaishuyuan.com': { _name: '斋书苑', '.': [{ title: '最新章节', docs: 'https://docs.rsshub.app/reading.html#zhai-shu-yuan', source: ['/book/:id', '/read/:id'], target: '/novel/zhaishuyuan/:id' }] },
    'hbut.edu.cn': {
        _name: '湖北工业大学',
        www: [
            {
                title: '新闻中心',
                docs: 'http://docs.rsshub.app/university.html#hu-bei-gong-ye-da-xue',
                source: '/xwzx/:name',
                target: (params) => {
                    const type = params.name.replace('.htm', '');
                    return type ? `/hbut/news/${type}` : '/hbut/news/tzgg';
                },
            },
        ],
        jsjxy: [
            { title: '新闻动态', docs: 'http://docs.rsshub.app/university.html#hu-bei-gong-ye-da-xue', source: '/index/xwdt.htm', target: '/hbut/cs/xwdt' },
            { title: '通知公告', docs: 'http://docs.rsshub.app/university.html#hu-bei-gong-ye-da-xue', source: '/index/tzgg.htm', target: '/hbut/cs/tzgg' },
            { title: '教学信息', docs: 'http://docs.rsshub.app/university.html#hu-bei-gong-ye-da-xue', source: '/jxxx.htm', target: '/hbut/cs/jxxx' },
            { title: '科研动态', docs: 'http://docs.rsshub.app/university.html#hu-bei-gong-ye-da-xue', source: '/kxyj/kydt.htm', target: '/hbut/cs/kydt' },
            { title: '党建活动', docs: 'http://docs.rsshub.app/university.html#hu-bei-gong-ye-da-xue', source: '/djhd/djhd.htm', target: '/hbut/cs/djhd' },
        ],
    },
    // 'zcool.com.cn': {
    //     _name: '站酷',
    //     www: [
    //         { title: '发现', docs: 'https://docs.rsshub.app/design.html#zhan-ku', source: '', target: '/zcool/discover' },
    //         { title: '发现 - 精选 - 全部推荐', docs: 'https://docs.rsshub.app/design.html#zhan-ku', source: '', target: '/zcool/discover/all' },
    //         { title: '发现 - 精选 - 首页推荐', docs: 'https://docs.rsshub.app/design.html#zhan-ku', source: '', target: '/zcool/discover/home' },
    //         { title: '发现 - 精选 - 编辑精选', docs: 'https://docs.rsshub.app/design.html#zhan-ku', source: '', target: '/zcool/discover/home' },
    //         { title: '发现 - 精选 - 文章 - 编辑精选', docs: 'https://docs.rsshub.app/design.html#zhan-ku', source: '', target: '/zcool/discover/article' },
    //         { title: '作品榜单', docs: 'https://docs.rsshub.app/design.html#zhan-ku', source: '', target: '/zcool/top/design' },
    //         { title: '文章榜单', docs: 'https://docs.rsshub.app/design.html#zhan-ku', source: '', target: '/zcool/top/article' },
    //         { title: '用户作品', docs: 'https://docs.rsshub.app/design.html#zhan-ku', source: ['/u/:id'], target: '/zcool/user/:id' },
    //     ],
    // },
    't.me': {
        _name: 'Telegram',
        '.': [
            {
                title: '频道',
                docs: 'https://docs.rsshub.app/social-media.html#telegram',
                source: '/:username',
                target: (params, url, document) => {
                    const isChannel = document && document.querySelector('.tgme_action_button_label');
                    if (isChannel) {
                        return '/telegram/channel/:username';
                    }
                },
            },
            { title: '频道', docs: 'https://docs.rsshub.app/social-media.html#telegram', source: '/s/:username', target: '/telegram/channel/:username' },
        ],
    },
    'zhuixinfan.com': { _name: '追新番日剧站', '.': [{ title: '更新列表', docs: 'https://docs.rsshub.app/multimedia.html#zhui-xin-fan-ri-ju-zhan', source: ['/main.php'], target: '/zhuixinfan/list' }] },
    'etoland.co.kr': {
        _name: 'eTOLAND',
        '.': [{ title: '主题贴', docs: 'https://docs.rsshub.app/bbs.html#etoland', source: ['/bbs/board.php', '/plugin/mobile/board.php'], target: (params, url) => `/etoland/${new URL(url).searchParams.get('bo_table')}` }],
    },
    'onejav.com': {
        _name: 'OneJAV BT',
        '.': [
            {
                title: '今日种子',
                docs: 'https://docs.rsshub.app/multimedia.html#onejav',
                source: '/',
                target: (params, url, document) => {
                    const today = document.querySelector('div.card.mb-1.card-overview').getAttribute('data-date').replace(/-/g, '');
                    return `/onejav/day/${today}`;
                },
            },
            {
                title: '今日演员',
                docs: 'https://docs.rsshub.app/multimedia.html#onejav',
                source: '/',
                target: (params, url, document) => {
                    const star = document.querySelector('div.card-content > div > a').getAttribute('href');
                    return `/onejav${star}`;
                },
            },
            {
                title: '页面种子',
                docs: 'https://docs.rsshub.app/multimedia.html#onejav',
                source: ['/:type', '/:type/:key', '/:type/:key/:morekey'],
                target: (params, url, document) => {
                    const itype = params.morekey === undefined ? params.type : params.type === 'tag' ? 'tag' : 'day';
                    let ikey = `${itype === 'day' ? params.type : ''}${params.key || ''}${itype === 'tag' && params.morekey !== undefined ? '%2F' : ''}${params.morekey || ''}`;
                    if (ikey === '' && itype === 'tag') {
                        ikey = document.querySelector('div.thumbnail.is-inline > a').getAttribute('href').replace('/tag/', '').replace('/', '%2F');
                    } else if (ikey === '' && itype === 'actress') {
                        ikey = document.querySelector('div.card > a').getAttribute('href').replace('/actress/', '');
                    }
                    return `/onejav/${itype}/${ikey}`;
                },
            },
        ],
    },
    '141jav.com': {
        _name: '141JAV BT',
        '.': [
            {
                title: '今日种子',
                docs: 'https://docs.rsshub.app/multimedia.html#141jav',
                source: '/',
                target: (params, url, document) => {
                    const today = document.querySelector('div.card.mb-1.card-overview').getAttribute('data-date').replace(/-/g, '');
                    return `/141jav/day/${today}`;
                },
            },
            {
                title: '今日演员',
                docs: 'https://docs.rsshub.app/multimedia.html#141jav',
                source: '/',
                target: (params, url, document) => {
                    const star = document.querySelector('div.card-content > div > a').getAttribute('href');
                    return `/141jav${star}`;
                },
            },
            {
                title: '页面种子',
                docs: 'https://docs.rsshub.app/multimedia.html#141jav',
                source: ['/:type', '/:type/:key', '/:type/:key/:morekey'],
                target: (params, url, document) => {
                    const itype = params.morekey === undefined ? params.type : params.type === 'tag' ? 'tag' : 'day';
                    let ikey = `${itype === 'day' ? params.type : ''}${params.key || ''}${itype === 'tag' && params.morekey !== undefined ? '%2F' : ''}${params.morekey || ''}`;
                    if (ikey === '' && itype === 'tag') {
                        ikey = document.querySelector('div.thumbnail.is-inline > a').getAttribute('href').replace('/tag/', '').replace('/', '%2F');
                    } else if (ikey === '' && itype === 'actress') {
                        ikey = document.querySelector('div.card > a').getAttribute('href').replace('/actress/', '');
                    }
                    return `/141jav/${itype}/${ikey}`;
                },
            },
        ],
    },
    '141ppv.com': {
        _name: '141ppv BT',
        '.': [
            {
                title: '今日种子',
                docs: 'https://docs.rsshub.app/multimedia.html#141pvp',
                source: '/',
                target: (params, url, document) => {
                    const today = document.querySelector('div.card.mb-1.card-overview').getAttribute('data-date').replace(/-/g, '');
                    return `/141ppv/day/${today}`;
                },
            },
            {
                title: '今日演员',
                docs: 'https://docs.rsshub.app/multimedia.html#141ppv',
                source: '/',
                target: (params, url, document) => {
                    const star = document.querySelector('div.card-content > div > a').getAttribute('href');
                    return `/141ppv${star}`;
                },
            },
            {
                title: '页面种子',
                docs: 'https://docs.rsshub.app/multimedia.html#141ppv',
                source: ['/:type', '/:type/:key', '/:type/:key/:morekey'],
                target: (params, url, document) => {
                    const itype = params.morekey === undefined ? params.type : params.type === 'tag' ? 'tag' : 'day';
                    let ikey = `${itype === 'day' ? params.type : ''}${params.key || ''}${itype === 'tag' && params.morekey !== undefined ? '%2F' : ''}${params.morekey || ''}`;
                    if (ikey === '' && itype === 'tag') {
                        ikey = document.querySelector('div.thumbnail.is-inline > a').getAttribute('href').replace('/tag/', '').replace('/', '%2F');
                    } else if (ikey === '' && itype === 'actress') {
                        ikey = document.querySelector('div.card > a').getAttribute('href').replace('/actress/', '');
                    }
                    return `/141ppv/${itype}/${ikey}`;
                },
            },
        ],
    },
    'sexinsex.net': {
        _name: 'sexinsex',
        '.': [
            {
                title: '分区帖子',
                docs: 'https://docs.rsshub.app/multimedia.html#sexinsex',
                source: '/bbs/:path',
                target: (params, url) => {
                    let pid, typeid;
                    const static_matched = params.path.match(/forum-(\d+)-\d+.html/);
                    if (static_matched) {
                        pid = static_matched[1];
                    } else if (params.path === 'forumdisplay.php') {
                        pid = new URL(url).searchParams.get('fid');
                        typeid = new URL(url).searchParams.get('typeid');
                    } else {
                        return false;
                    }
                    return `/sexinsex/${pid}/${typeid ? typeid : ''}`;
                },
            },
        ],
    },
    't66y.com': {
        _name: '草榴社区',
        www: [
            {
                title: '分区帖子',
                docs: 'https://docs.rsshub.app/multimedia.html#cao-liu-she-qu',
                source: '/thread0806.php',
                target: (params, url) => {
                    const id = new URL(url).searchParams.get('fid');
                    const type = new URL(url).searchParams.get('type');
                    return `/t66y/${id}/${type ? type : ''}`;
                },
            },
        ],
    },
    'umass.edu': {
        _name: 'UMASS Amherst',
        ece: [
            { title: 'ECE News', docs: 'http://docs.rsshub.app/en/university.html#umass-amherst', source: '/news', target: '/umass/amherst/ecenews' },
            { title: 'ECE Seminar', docs: 'http://docs.rsshub.app/en/university.html#umass-amherst', source: '/seminars', target: '/umass/amherst/eceseminar' },
        ],
        'www.cics': [{ title: 'CICS News', docs: 'http://docs.rsshub.app/en/university.html#umass-amherst', source: '/news', target: '/umass/amherst/csnews' }],
        www: [
            { title: 'IPO Events', docs: 'http://docs.rsshub.app/en/university.html#umass-amherst', source: '/ipo/iss/events', target: '/umass/amherst/ipoevents' },
            { title: 'IPO Featured Stories', docs: 'http://docs.rsshub.app/en/university.html#umass-amherst', source: '/ipo/iss/featured-stories', target: '/umass/amherst/ipostories' },
        ],
    },
    'bjeea.com': {
        _name: '北京考试院',
        www: [
            { title: '首页 / 通知公告', docs: 'https://docs.rsshub.app/government.html#bei-jing-jiao-yu-kao-shi-yuan', source: ['/html/bjeeagg'], target: '/gov/beijing/bjeea/bjeeagg' },
            { title: '首页 / 招考政策', docs: 'https://docs.rsshub.app/government.html#bei-jing-jiao-yu-kao-shi-yuan', source: ['/html/zkzc'], target: '/gov/beijing/bjeea/zkzc' },
            { title: '首页 / 自考快递', docs: 'https://docs.rsshub.app/government.html#bei-jing-jiao-yu-kao-shi-yuan', source: ['/html/zkkd'], target: '/gov/beijing/bjeea/zkkd' },
        ],
    },
    // 'hk01.com': {
    //     _name: '香港01',
    //     www: [
    //         { title: '最 Hit', docs: 'https://docs.rsshub.app/traditional-media.html#xiang-gang-01', source: ['/hot', '/'], target: '/hk01/hot' },
    //         { title: 'zone', docs: 'https://docs.rsshub.app/traditional-media.html#xiang-gang-01', source: '/zone/:id/:title', target: '/hk01/zone/:id' },
    //         { title: 'channel', docs: 'https://docs.rsshub.app/traditional-media.html#xiang-gang-01', source: '/channel/:id/:title', target: '/hk01/channel/:id' },
    //         { title: 'issue', docs: 'https://docs.rsshub.app/traditional-media.html#xiang-gang-01', source: '/issue/:id/:title', target: '/hk01/issue/:id' },
    //         { title: 'tag', docs: 'https://docs.rsshub.app/traditional-media.html#xiang-gang-01', source: '/tag/:id/:title', target: '/hk01/tag/:id' },
    //     ],
    // },
    'douban.com': {
        _name: '豆瓣',
        www: [
            {
                title: '用户的广播',
                docs: 'https://docs.rsshub.app/social-media.html#dou-ban',
                source: '/people/:user/',
                target: (params, url, document) => {
                    const uid = document && document.querySelector('html').innerHTML.match(/"id":"([0-9]+)"/)[1];
                    return uid ? `/douban/people/${uid}/status` : '';
                },
            },
            { title: '小组-最新', docs: 'https://docs.rsshub.app/social-media.html#dou-ban', source: '/group/:groupid', target: '/douban/group/:groupid' },
            { title: '小组-最热', docs: 'https://docs.rsshub.app/social-media.html#dou-ban', source: '/group/:groupid', target: '/douban/group/:groupid/essence' },
            { title: '小组-精华', docs: 'https://docs.rsshub.app/social-media.html#dou-ban', source: '/group/:groupid', target: '/douban/group/:groupid/elite' },
        ],
    },
    'ems.com.cn': { _name: '中国邮政速递物流', www: [{ title: '新闻', docs: 'https://docs.rsshub.app/other.html#zhong-guo-you-zheng-su-di-wu-liu', source: '/aboutus/xin_wen_yu_shi_jian.html', target: '/ems/news' }] },
    'popiapp.cn': {
        _name: 'Popi 提问箱',
        www: [
            {
                title: '提问箱新回答',
                docs: 'https://docs.rsshub.app/social-media.html#popi-ti-wen-xiang',
                source: '/:id',
                target: (params) => {
                    if (params.id) {
                        return '/popiask/:id';
                    }
                },
            },
        ],
    },
    'nppa.gov.cn': {
        _name: '国家新闻出版署',
        www: [
            { title: '栏目', docs: 'https://docs.rsshub.app/government.html#guo-jia-xin-wen-chu-ban-shu', source: '/nppa/channels/:channel', target: (params, url) => `/gov/nppa/${/nppa\/channels\/(\d+)\.shtml/.exec(url)[1]}` },
            {
                title: '内容',
                docs: 'https://docs.rsshub.app/government.html#guo-jia-xin-wen-chu-ban-shu',
                source: '/nppa/contents/:channel/:content',
                target: (params, url) => `/gov/nppa/${/nppa\/contents\/(\d+\/\d+)\.shtml/.exec(url)[1]}`,
            },
        ],
    },
    'jjmhw.cc': { _name: '漫小肆', www: [{ title: '漫画更新', docs: 'https://docs.rsshub.app/anime.html#man-xiao-si', source: '/book/:id', target: '/manxiaosi/book/:id' }] },
    'wenxuecity.com': {
        _name: '文学城',
        blog: [
            { title: '博客', docs: 'https://docs.rsshub.app/bbs.html#wen-xue-cheng-bo-ke', source: '/myblog/:id', target: '/wenxuecity/blog/:id' },
            { title: '博客', docs: 'https://docs.rsshub.app/bbs.html#wen-xue-cheng-bo-ke', source: '/myoverview/:id', target: '/wenxuecity/blog/:id' },
        ],
        bbs: [
            { title: '最新主题', docs: 'https://docs.rsshub.app/bbs.html#wen-xue-cheng-zui-xin-zhu-ti', source: '/:cat', target: '/wenxuecity/bbs/:cat' },
            { title: '最新主题 - 精华区', docs: 'https://docs.rsshub.app/bbs.html#wen-xue-cheng-zui-xin-zhu-ti', source: '/:cat', target: '/wenxuecity/bbs/:cat/1' },
            {
                title: '最热主题',
                docs: 'https://docs.rsshub.app/bbs.html#wen-xue-cheng-zui-re-zhu-ti',
                source: '/?cid=*',
                target: (params, url, document) => {
                    const cid = document && new URL(document.location).searchParams.get('cid');
                    return `/wenxuecity/hot/${cid}`;
                },
            },
        ],
    },
    'buaq.net': { _name: '不安全资讯', '.': [{ title: '不安全资讯', docs: 'http://docs.rsshub.app/new-media.html#bu-an-quan', source: '/', target: '/buaq' }] },
    'jian-ning.com': { _name: '建宁闲谈', '.': [{ title: '文章', docs: 'https://docs.rsshub.app/blog.html#jian-ning-xian-tan', source: '/*', target: '/blogs/jianning' }] },
    'matataki.io': {
        _name: 'matataki',
        www: [
            { title: '最热作品', docs: 'https://docs.rsshub.app/new-media.html#matataki', source: '/article/', target: '/matataki/posts/hot' },
            { title: '最新作品', docs: 'https://docs.rsshub.app/new-media.html#matataki', source: '/article/latest', target: '/matataki/posts/latest' },
            { title: '作者创作', docs: 'https://docs.rsshub.app/new-media.html#matataki', source: '/user/:uid', target: (params) => `/matataki/users/${params.uid}/posts` },
            { title: 'Fan票关联作品', docs: 'https://docs.rsshub.app/new-media.html#matataki', source: ['/token/:tokenId', '/token/:tokenId/circle'], target: (params) => `/matataki/tokens/${params.tokenId}/posts` },
            {
                title: '标签关联作品',
                docs: 'https://docs.rsshub.app/new-media.html#matataki',
                source: ['/tag/:tagId'],
                target: (params, url) => {
                    const tagName = new URL(url).searchParams.get('name');
                    return `/matataki/tags/${params.tagId}/${tagName}/posts`;
                },
            },
            { title: '收藏夹', docs: 'https://docs.rsshub.app/new-media.html#matataki', source: '/user/:uid/favlist/:fid', target: (params) => `/matataki/users/${params.uid}/favorites/${params.fid}/posts` },
        ],
    },
    'eventernote.com': { _name: 'Eventernote', www: [{ title: '声优活动及演唱会', docs: 'https://docs.rsshub.app/anime.html#eventernote', source: '/actors/:name/:id/events', target: '/eventernote/actors/:name/:id' }] },
    'huya.com': { _name: '虎牙直播', '.': [{ title: '直播间开播', docs: 'https://docs.rsshub.app/live.html#hu-ya-zhi-bo-zhi-bo-jian-kai-bo', source: '/:id', target: '/huya/live/:id' }] },
    'craigslist.org': { _name: 'Craigslist', '.': [{ title: '商品搜索列表', docs: 'https://docs.rsshub.app/shopping.html#craigslist' }] },
    'scboy.com': {
        _name: 'scboy 论坛',
        www: [
            {
                title: '帖子',
                docs: 'https://docs.rsshub.app/bbs.html#scboy',
                source: '',
                target: (params, url) => {
                    const id = url.includes('thread') ? url.split('-')[1].split('.')[0] : '';
                    return id ? `/scboy/thread/${id}` : '';
                },
            },
        ],
    },
    'cqut.edu.cn': {
        _name: '重庆理工大学',
        tz: [{ title: '通知', docs: 'https://docs.rsshub.app/university.html#chong-qing-li-gong-da-xue', source: '/*' }],
        lib: [{ title: '图书馆通知', docs: 'https://docs.rsshub.app/university.html#chong-qing-li-gong-da-xue', source: '/*' }],
    },
    'cqwu.net': {
        _name: '重庆文理学院',
        www: [
            {
                title: '通知',
                docs: 'https://docs.rsshub.app/university.html#chong-qing-wen-li-xue-yuan',
                source: '/:type',
                target: (params) => {
                    if (params.type === 'channel_7721.html') {
                        return '/cqwu/news/notify';
                    }
                },
            },
            {
                title: '学术活动',
                docs: 'https://docs.rsshub.app/university.html#chong-qing-wen-li-xue-yuan',
                source: '/:type',
                target: (params) => {
                    if (params.type === 'channel_7722.html') {
                        return '/cqwu/news/academiceve';
                    }
                },
            },
        ],
    },
    'trakt.tv': {
        _name: 'Trakt.tv',
        '.': [
            {
                title: '用户收藏',
                docs: 'https://docs.rsshub.app/multimedia.html#trakt-tv-yong-hu-shou-cang',
                source: ['/users/:username/collection/:type/added', '/users/:username/collection'],
                target: (params) => `/trakt/collection/${params.username}/${params.type || 'all'}`,
            },
        ],
    },
    'furaffinity.net': {
        _name: 'Fur Affinity',
        www: [
            { title: '主页', docs: 'https://docs.rsshub.app/social-media.html#fur-affinity', source: '/', target: '/furaffinity/home' },
            { title: '浏览', docs: 'https://docs.rsshub.app/social-media.html#fur-affinity', source: '/browse/', target: '/furaffinity/browse' },
            { title: '站点状态', docs: 'https://docs.rsshub.app/social-media.html#fur-affinity', source: '/', target: '/furaffinity/status' },
            {
                title: '搜索',
                docs: 'https://docs.rsshub.app/social-media.html#fur-affinity',
                source: '/search/',
                target: (params, url) => {
                    const keyword = new URL(url).searchParams.get('q');
                    if (keyword) {
                        return `/furaffinity/search/${keyword}`;
                    }
                },
            },
            { title: '用户主页简介', docs: 'https://docs.rsshub.app/social-media.html#fur-affinity', source: '/user/:username/', target: '/furaffinity/user/:username' },
            { title: '用户关注列表', docs: 'https://docs.rsshub.app/social-media.html#fur-affinity', source: '/watchlist/by/:username/', target: '/furaffinity/watching/:username' },
            { title: '用户被关注列表', docs: 'https://docs.rsshub.app/social-media.html#fur-affinity', source: '/watchlist/to/:username/', target: '/furaffinity/watchers/:username' },
            { title: '用户接受委托信息', docs: 'https://docs.rsshub.app/social-media.html#fur-affinity', source: '/commissions/:username/', target: '/furaffinity/commissions/:username' },
            { title: '用户的 Shouts 留言', docs: 'https://docs.rsshub.app/social-media.html#fur-affinity', source: '/user/:username/', target: '/furaffinity/shouts/:username' },
            { title: '用户的日记', docs: 'https://docs.rsshub.app/social-media.html#fur-affinity', source: '/journals/:username/', target: '/furaffinity/journals/:username' },
            { title: '用户的创作画廊', docs: 'https://docs.rsshub.app/social-media.html#fur-affinity', source: '/gallery/:username/', target: '/furaffinity/gallery/:username' },
            { title: '用户非正式作品', docs: 'https://docs.rsshub.app/social-media.html#fur-affinity', source: '/scraps/:username/', target: '/furaffinity/scraps/:username' },
            { title: '用户的喜爱列表', docs: 'https://docs.rsshub.app/social-media.html#fur-affinity', source: '/favorites/:username/', target: '/furaffinity/favorites/:username' },
            { title: '作品评论区', docs: 'https://docs.rsshub.app/social-media.html#fur-affinity', source: '/view/:id/', target: '/furaffinity/submission_comments/:id' },
            { title: '日记评论区', docs: 'https://docs.rsshub.app/social-media.html#fur-affinity', source: '/journal/:id/', target: '/furaffinity/journal_comments/:id' },
        ],
    },
    'e-hentai.org/': {
        _name: 'E-Hentai',
        '.': [
            { title: '收藏', docs: 'https://docs.rsshub.app/picture.html#ehentai', source: '/favorites.php', target: '/ehentai/favorites' },
            { title: '标签', docs: 'https://docs.rsshub.app/picture.html#ehentai', source: '/tag/:tag', target: '/ehentai/tag/:tag' },
            {
                title: '搜索',
                docs: 'https://docs.rsshub.app/picture.html#ehentai',
                source: '/',
                target: (params, url) => {
                    const keyword = new URL(url).searchParams.toString();
                    if (keyword) {
                        return `/ehentai/search/${keyword}`;
                    }
                },
            },
        ],
    },
    'iyingdi.com': {
        _name: '旅法师营地',
        www: [
            { title: '分区', docs: 'https://docs.rsshub.app/game.html#lv-fa-shi-ying-di', source: '/tz/tag/:tag', target: '/lfsyd/tag/:tag' },
            { title: '用户发帖', docs: 'https://docs.rsshub.app/game.html#lv-fa-shi-ying-di', source: ['/tz/people/:id', '/tz/people/:id/*'], target: '/lfsyd/user/:id' },
        ],
        mob: [{ title: '分区', docs: 'https://docs.rsshub.app/game.html#lv-fa-shi-ying-di', source: '/fine/:tag', target: '/lfsyd/tag/:tag' }],
    },
    'macwk.com': { _name: 'MacWk', '.': [{ title: '应用更新', docs: 'https://docs.rsshub.app/program-update.html#macwk', source: '/soft/:name', target: '/macwk/soft/:name' }] },
    // 'zyshow.net': { www: [{ title: '', docs: 'https://docs.rsshub.app/game.html#lv-fa-shi-ying-di', source: '/:name/', target: '/zyshow/:name' }] },
    'foreverblog.cn': {
        _name: 'foreverblog',
        www: [
            {
                title: '十年之约',
                docs: 'https://docs.rsshub.app/social-media.html#foreverblog',
            },
        ],
    },
});
