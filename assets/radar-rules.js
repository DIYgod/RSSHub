({
    'bilibili.com': {
        _name: 'bilibili',
        www: [
            {
                title: '分区视频',
                docs: 'https://docs.rsshub.app/social-media.html#bilibili',
                source: ['/v/*tpath', '/documentary', '/movie', '/tv'],
            },
            {
                title: '视频评论',
                docs: 'https://docs.rsshub.app/social-media.html#bilibili',
                source: '/video/:aid',
                target: (params) => `/bilibili/video/reply/${params.aid.replace('av', '')}`,
            },
            {
                title: '视频弹幕',
                docs: 'https://docs.rsshub.app/social-media.html#bilibili',
                source: '/video/:aid',
                target: (params, url) => {
                    const pid = new URL(url).searchParams.get('p');
                    return `/bilibili/video/danmaku/${params.aid.replace('av', '')}/${pid ? pid : 1}`;
                },
            },
            {
                title: '番剧',
                docs: 'https://docs.rsshub.app/social-media.html#bilibili',
                source: '/bangumi/media/:bid',
                target: (params) => `/bilibili/bangumi/media/${params.bid.replace('md', '')}`,
            },
        ],
        space: [
            {
                title: 'UP 主动态',
                docs: 'https://docs.rsshub.app/social-media.html#bilibili',
                source: '/:uid',
                target: '/bilibili/user/dynamic/:uid',
            },
            {
                title: 'UP 主投稿',
                docs: 'https://docs.rsshub.app/social-media.html#bilibili',
                source: '/:uid',
                target: '/bilibili/user/video/:uid',
            },
        ],
    },
    'weibo.com': {
        _name: '微博',
        '.': [
            {
                title: '博主',
                docs: 'https://docs.rsshub.app/social-media.html#wei-bo',
                source: ['/u/:id', '/:id'],
                target: '/weibo/user/:uid',
                script: "({uid: document.querySelector('head').innerHTML.match(/\\$CONFIG\\['oid']='(\\d+)'/)[1]})",
                verification: (params) => params.uid,
            },
            {
                title: '关键词',
                docs: 'https://docs.rsshub.app/social-media.html#wei-bo',
            },
            {
                title: '超话',
                docs: 'https://docs.rsshub.app/social-media.html#wei-bo',
                source: '/p/:id/super_index',
                target: '/weibo/super_index/:id',
            },
        ],
        s: [
            {
                title: '热搜榜',
                docs: 'https://docs.rsshub.app/social-media.html#wei-bo',
                source: '/top/summary',
                target: '/weibo/search/hot',
            },
        ],
    },
    'pixiv.net': {
        _name: 'Pixiv',
        www: [
            {
                title: '用户收藏',
                docs: 'https://docs.rsshub.app/social-media.html#pixiv',
                source: '/bookmark.php',
                target: (params, url) => `/pixiv/user/bookmarks/${new URL(url).searchParams.get('id')}`,
            },
            {
                title: '用户动态',
                docs: 'https://docs.rsshub.app/social-media.html#pixiv',
                source: '/member.php',
                target: (params, url) => `/pixiv/user/${new URL(url).searchParams.get('id')}`,
            },
            {
                title: '排行榜',
                docs: 'https://docs.rsshub.app/social-media.html#pixiv',
                source: '/ranking.php',
            },
            {
                title: '关键词',
                docs: 'https://docs.rsshub.app/social-media.html#pixiv',
                source: '/search.php',
            },
            {
                title: '关注的新作品',
                docs: 'https://docs.rsshub.app/social-media.html#pixiv',
                source: '/bookmark_new_illust.php',
                target: '/pixiv/user/illustfollows',
            },
        ],
    },
    'twitter.com': {
        _name: 'Twitter',
        '.': [
            {
                title: '用户时间线',
                docs: 'https://docs.rsshub.app/social-media.html#twitter',
                source: '/:id',
                target: '/twitter/user/:id',
                verification: (params) => params.id !== 'home' && params.id !== 'explore' && params.id !== 'notifications' && params.id !== 'messages' && params.id !== 'explore' && params.id !== 'search',
            },
            {
                title: '用户关注时间线',
                docs: 'https://docs.rsshub.app/social-media.html#twitter',
                source: '/:id',
                target: '/twitter/followings/:id',
                verification: (params) => params.id !== 'home' && params.id !== 'explore' && params.id !== 'notifications' && params.id !== 'messages' && params.id !== 'explore' && params.id !== 'search',
            },
            {
                title: '用户喜欢列表',
                docs: 'https://docs.rsshub.app/social-media.html#twitter',
                source: '/:id',
                target: '/twitter/likes/:id',
                verification: (params) => params.id !== 'home' && params.id !== 'explore' && params.id !== 'notifications' && params.id !== 'messages' && params.id !== 'explore' && params.id !== 'search',
            },
            {
                title: '列表时间线',
                docs: 'https://docs.rsshub.app/social-media.html#twitter',
                source: '/:id/lists/:name',
                target: '/twitter/list/:id/:name',
                verification: (params) => params.id !== 'home' && params.id !== 'explore' && params.id !== 'notifications' && params.id !== 'messages' && params.id !== 'explore' && params.id !== 'search',
            },
            {
                title: '关键词',
                docs: 'https://docs.rsshub.app/social-media.html#twitter',
                source: '/search',
                target: (params, url) => `/twitter/keyword/${new URL(url).searchParams.get('q')}`,
            },
        ],
    },
    'youtube.com': {
        _name: 'Youtube',
        www: [
            {
                title: '用户',
                docs: 'https://docs.rsshub.app/social-media.html#youtube',
                source: '/user/:username',
                target: '/youtube/user/:username',
            },
            {
                title: '频道',
                docs: 'https://docs.rsshub.app/social-media.html#youtube',
                source: '/channel/:id',
                target: '/youtube/channel/:id',
            },
            {
                title: '播放列表',
                docs: 'https://docs.rsshub.app/social-media.html#youtube',
                source: '/playlist',
                target: (params, url) => `/youtube/playlist/${new URL(url).searchParams.get('list')}`,
            },
        ],
    },
    'github.com': {
        _name: 'GitHub',
        '.': [
            {
                title: '用户仓库',
                docs: 'https://docs.rsshub.app/programming.html#github',
                source: '/:user',
                target: '/github/repos/:user',
            },
            {
                title: '用户 Followers',
                docs: 'https://docs.rsshub.app/programming.html#github',
                source: '/:user',
                target: '/github/user/followers/:user',
            },
            {
                title: 'Trending',
                docs: 'https://docs.rsshub.app/programming.html#github',
                source: '/trending',
                target: '/github/trending/:since',
            },
            {
                title: '仓库 Issue',
                docs: 'https://docs.rsshub.app/programming.html#github',
                source: ['/:user/:repo/issues', '/:user/:repo/issues/:id', '/:user/:repo'],
                target: '/github/issue/:user/:repo',
            },
            {
                title: '仓库 Pull Requests',
                docs: 'https://docs.rsshub.app/programming.html#github',
                source: ['/:user/:repo/pulls', '/:user/:repo/pulls/:id', '/:user/:repo'],
                target: '/github/pull/:user/:repo',
            },
            {
                title: '仓库 Stars',
                docs: 'https://docs.rsshub.app/programming.html#github',
                source: ['/:user/:repo/stargazers', '/:user/:repo'],
                target: '/github/stars/:user/:repo',
            },
            {
                title: '仓库 Branches',
                docs: 'https://docs.rsshub.app/programming.html#github',
                source: ['/:user/:repo/branches', '/:user/:repo'],
                target: '/github/branches/:user/:repo',
            },
            {
                title: '文件 Commits',
                docs: 'https://docs.rsshub.app/programming.html#github',
                source: '/:user/:repo/blob/:branch/*filepath',
                target: '/github/file/:user/:repo/:branch/:filepath',
            },
            {
                title: '用户 Starred Repositories',
                docs: 'https://docs.rsshub.app/programming.html#github',
                source: '/:user',
                target: '/github/starred_repos/:user',
            },
        ],
    },
    'zhihu.com': {
        _name: '知乎',
        www: [
            {
                title: '收藏夹',
                docs: 'https://docs.rsshub.app/social-media.html#zhi-hu',
                source: '/collection/:id',
                target: '/zhihu/collection/:id',
            },
            {
                title: '用户动态',
                docs: 'https://docs.rsshub.app/social-media.html#zhi-hu',
                source: '/people/:id/activities',
                target: '/zhihu/people/activities/:id',
            },
            {
                title: '用户回答',
                docs: 'https://docs.rsshub.app/social-media.html#zhi-hu',
                source: '/people/:id/answers',
                target: '/zhihu/people/answers/:id',
            },
            {
                title: '用户想法',
                docs: 'https://docs.rsshub.app/social-media.html#zhi-hu',
                source: '/people/:id/pins',
                target: '/zhihu/people/pins/:id',
            },
            {
                title: '用户文章',
                docs: 'https://docs.rsshub.app/social-media.html#zhi-hu',
                source: '/people/:id/posts',
                target: '/zhihu/people/posts/:id',
            },
            {
                title: '热榜',
                docs: 'https://docs.rsshub.app/social-media.html#zhi-hu',
                source: '/hot',
                target: '/zhihu/hotlist',
            },
            {
                title: '想法热榜',
                docs: 'https://docs.rsshub.app/social-media.html#zhi-hu',
                target: '/zhihu/pin/hotlist',
            },
            {
                title: '问题',
                docs: 'https://docs.rsshub.app/social-media.html#zhi-hu',
                source: '/question/:questionId',
                target: '/zhihu/question/:questionId',
            },
            {
                title: '话题',
                docs: 'https://docs.rsshub.app/social-media.html#zhi-hu',
                source: '/topic/:topicId/:type',
                target: '/zhihu/topic/:topicId',
            },
            {
                title: '新书',
                docs: 'https://docs.rsshub.app/social-media.html#zhi-hu',
                source: '/zhihu/bookstore/newest',
                target: '/zhihu/pin/hotlist',
            },
            {
                title: '想法-24 小时新闻汇总',
                docs: 'https://docs.rsshub.app/social-media.html#zhi-hu',
                source: '/pin/special/972884951192113152',
                target: '/zhihu/pin/daily',
            },
            {
                title: '书店-周刊',
                docs: 'https://docs.rsshub.app/social-media.html#zhi-hu',
                source: '/pub/weekly',
                target: '/zhihu/weekly',
            },
        ],
        zhuanlan: [
            {
                title: '专栏',
                docs: 'https://docs.rsshub.app/social-media.html#zhi-hu',
                source: '/:id',
                target: '/zhihu/zhuanlan/:id',
            },
        ],
        daily: [
            {
                title: '日报',
                docs: 'https://docs.rsshub.app/social-media.html#zhi-hu',
                source: '',
                target: '/zhihu/daily',
            },
            {
                title: '日报',
                docs: 'https://docs.rsshub.app/social-media.html#zhi-hu',
                source: '/*tpath',
                target: '/zhihu/daily',
            },
        ],
    },
    'smzdm.com': {
        _name: '什么值得买',
        www: [
            {
                title: '排行榜',
                docs: 'https://docs.rsshub.app/shopping.html#shen-me-zhi-de-mai',
                source: '/top',
            },
        ],
        search: [
            {
                title: '关键词',
                docs: 'https://docs.rsshub.app/shopping.html#shen-me-zhi-de-mai',
                source: '/',
                target: (params, url) => `/smzdm/keyword/${new URL(url).searchParams.get('s')}`,
            },
        ],
    },
    'rsshub.app': {
        _name: 'RSSHub',
        docs: [
            {
                title: '有新路由啦',
                docs: 'https://docs.rsshub.app/program-update.html#rsshub',
                source: ['', '/*tpath'],
                target: '/rsshub/rss',
            },
        ],
    },
    'ximalaya.com': {
        _name: '喜马拉雅',
        www: [
            {
                title: '专辑',
                docs: 'https://docs.rsshub.app/multimedia.html#xi-ma-la-ya',
                source: '/:type/:id',
                target: '/ximalaya/album/:id/',
                verification: (params) => parseInt(params.id) + '' === params.id,
            },
        ],
    },
    'algocasts.io': {
        _name: 'AlgoCasts',
        '.': [
            {
                title: '视频更新',
                docs: 'https://docs.rsshub.app/programming.html#algocasts',
                source: '/episodes',
                target: '/algocasts',
            },
        ],
    },
    'soulapp.cn': {
        _name: 'Soul',
        '.': [
            {
                title: '瞬间更新',
                docs: 'https://docs.rsshub.app/social-media.html#soul',
            },
        ],
    },
    'juejin.im': {
        _name: '掘金',
        '.': [
            {
                title: '专栏',
                docs: 'https://docs.rsshub.app/programming.html#jue-jin',
                source: '/user/:id/posts',
                target: '/juejin/posts/:id',
            },
        ],
    },
    'anime1.me': {
        _name: 'Anime1',
        '.': [
            {
                title: '動畫',
                docs: 'https://docs.rsshub.app/anime.html#anime1',
                source: '/category/:time/:name',
                target: '/anime1/anime/:time/:name',
            },
            {
                title: '搜尋',
                docs: 'https://docs.rsshub.app/anime.html#anime1',
                source: '/',
                script: "({keyword: new URLSearchParams(location.search).get('s')})",
                target: '/anime1/search/:keyword',
                verification: (params) => params.keyword,
            },
        ],
    },
    'instagram.com': {
        _name: 'Instagram',
        www: [
            {
                title: '用户',
                docs: 'https://docs.rsshub.app/social-media.html#instagram',
                source: '/:id',
                target: '/instagram/user/:id',
                verification: (params) => params.id !== 'explore' && params.id !== 'developer',
            },
            {
                title: '标签',
                docs: 'https://docs.rsshub.app/social-media.html#instagram',
                source: '/explore/tags/:tag',
                target: '/instagram/tag/:tag',
            },
        ],
    },
    'swufe.edu.cn': {
        _name: '西南财经大学',
        it: [
            {
                title: '经济信息工程学院 - 通知公告',
                docs: 'https://docs.rsshub.app/university.html#xi-nan-cai-jing-da-xue',
                source: '/index/tzgg.htm',
                target: '/universities/swufe/seie/tzgg',
            },
            {
                title: '经济信息工程学院 - 学院新闻',
                docs: 'https://docs.rsshub.app/university.html#xi-nan-cai-jing-da-xue',
                source: '/index/xyxw.htm',
                target: '/universities/swufe/seie/xyxw',
            },
        ],
    },
    'ishuhui.com': {
        _name: '鼠绘漫画',
        www: [
            {
                title: '鼠绘漫画',
                docs: 'https://docs.rsshub.app/anime.html#shu-hui-man-hua',
                source: '/comics/anime/:id',
                target: '/shuhui/comics/:id',
            },
        ],
    },
    'haimaoba.com': {
        _name: '海猫吧',
        www: [
            {
                title: '漫画更新',
                docs: 'https://docs.rsshub.app/anime.html#hai-mao-ba',
                source: '/catalog/:id',
                target: '/haimaoba/:id',
            },
        ],
    },
    'pgyer.com': {
        _name: '蒲公英应用分发',
        www: [
            {
                title: 'app更新',
                docs: 'https://docs.rsshub.app/program-update.html#pu-gong-ying-ying-yong-fen-fa',
                source: '/:app',
                target: '/pgyer/:app',
            },
        ],
    },
    'pianyuan.la': {
        _name: '片源网',
        '.': [
            {
                title: '电影和剧集',
                description: 'https://docs.rsshub.app/multimedia.html#pian-yuan',
                source: '/',
            },
        ],
    },
    'sspai.com': {
        _name: '少数派',
        '.': [
            {
                title: '最新上架付费专栏',
                docs: 'https://docs.rsshub.app/new-media.html#shao-shu-pai-sspai',
                source: '/series',
                target: '/sspai/series',
            },
            {
                title: 'Matrix',
                docs: 'https://docs.rsshub.app/new-media.html#shao-shu-pai-sspai',
                source: '/matrix',
                target: '/sspai/matrix',
            },
            {
                title: '专栏',
                docs: 'https://docs.rsshub.app/new-media.html#shao-shu-pai-sspai',
                source: '/column/:id',
                target: '/sspai/column/:id',
            },
            {
                title: '作者已发布文章',
                docs: 'https://docs.rsshub.app/new-media.html#shao-shu-pai-sspai',
                source: ['/user/:id/posts', '/user/:id/updates'],
                target: '/sspai/author/:id',
            },
            {
                title: '专题',
                docs: 'https://docs.rsshub.app/new-media.html#shao-shu-pai-sspai',
                source: '/topics',
                target: '/sspai/topics',
            },
            {
                title: '专题内文章更新',
                docs: 'https://docs.rsshub.app/new-media.html#shao-shu-pai-sspai',
                source: '/topic/:id',
                target: '/sspai/topic/:id',
            },
        ],
        shortcuts: [
            {
                title: 'Shortcuts Gallery',
                docs: 'https://docs.rsshub.app/new-media.html#shao-shu-pai-sspai',
                source: ['', '/*tpath'],
                target: '/sspai/shortcuts',
            },
        ],
    },
    'baidu.com': {
        _name: '贴吧',
        tieba: [
            {
                title: '帖子列表',
                docs: 'https://docs.rsshub.app/bbs.html#tie-ba',
                source: 'f',
                target: (params, url) => `/tieba/forum/${new URL(url).searchParams.get('kw')}`,
                script: "({type: new URLSearchParams(location.search).get('tab')})",
                verification: (params) => !params.type || params.type === 'main',
            },
            {
                title: '精品帖子',
                docs: 'https://docs.rsshub.app/bbs.html#tie-ba',
                source: 'f',
                target: (params, url) => `/tieba/forum/good/${new URL(url).searchParams.get('kw')}`,
                script: "({type: new URLSearchParams(location.search).get('tab')})",
                verification: (params) => params.type === 'good',
            },
            {
                title: '帖子动态',
                docs: 'https://docs.rsshub.app/bbs.html#tie-ba',
                source: '/p/:id',
                target: '/tieba/post/:id',
            },
            {
                title: '只看楼主',
                docs: 'https://docs.rsshub.app/bbs.html#tie-ba',
                source: '/p/:id',
                target: '/tieba/post/lz/:id',
            },
        ],
    },
    'wineyun.com': {
        _name: '酒云网',
        www: [
            {
                title: '最新商品',
                description: 'https://docs.rsshub.app/other.html#jiu-yun-wang',
                source: ['/:category'],
                target: '/wineyun/:category',
            },
        ],
    },
    'epicgames.com': {
        _name: 'Epic Games',
        www: [
            {
                title: '每周免费游戏',
                docs: 'https://docs.rsshub.app/game.html#epicgames-freegame',
                source: '/store/zh-CN/free-games',
                target: '/epicgames/freegames',
            },
        ],
    },
    'docker.com': {
        _name: 'Docker',
        hub: [
            {
                title: '镜像有新 Build',
                docs: 'https://docs.rsshub.app/program-update.html#docker-hub',
                source: ['/r/:owner/:image', '/r/:owner/:image/tags', '/_/:image'],
                target: (params) => `/dockerhub/build/${params.owner ? params.owner : 'library'}/${params.image}`,
            },
        ],
    },
    'nga.cn': {
        _name: 'NGA',
        bbs: [
            {
                title: '分区帖子',
                docs: 'https://docs.rsshub.app/bbs.html#nga',
                source: '/thread.php',
                target: (params, url) => new URL(url).searchParams.get('fid') && `/nga/forum/${new URL(url).searchParams.get('fid')}`,
            },
            {
                title: '帖子',
                docs: 'https://docs.rsshub.app/bbs.html#nga',
                source: '/read.php',
                target: (params, url) => new URL(url).searchParams.get('tid') && `/nga/post/${new URL(url).searchParams.get('tid')}`,
            },
        ],
    },
    'playstation.com': {
        _name: 'PlayStation',
        store: [
            {
                title: '游戏列表',
                docs: 'https://docs.rsshub.app/game.html#playstation',
                source: '/zh-hans-hk/grid/:id/:page',
                target: '/ps/list/:id',
            },
        ],
        www: [
            {
                title: '用户奖杯',
                docs: 'https://docs.rsshub.app/game.html#playstation',
            },
            {
                title: '系统更新纪录',
                docs: 'https://docs.rsshub.app/game.html#playstation',
            },
        ],
    },
    'monsterhunter.com': {
        _name: '怪物猎人世界',
        www: [
            {
                title: '更新情报',
                docs: 'https://docs.rsshub.app/game.html#guai-wu-lie-ren-shi-jie',
                source: ['', '/*tpath'],
                target: '/mhw/update',
            },
            {
                title: '最新消息',
                docs: 'https://docs.rsshub.app/game.html#guai-wu-lie-ren-shi-jie',
                source: ['', '/*tpath'],
                target: '/mhw/news',
            },
        ],
    },
    'vgtime.com': {
        _name: '游戏时光',
        www: [
            {
                title: '新闻',
                docs: 'https://docs.rsshub.app/game.html#you-xi-shi-guang',
                source: '/topic/index.jhtml',
                target: '/vgtime/news',
            },
            {
                title: '游戏发售表',
                docs: 'https://docs.rsshub.app/game.html#you-xi-shi-guang',
                source: '/game/release.jhtml',
                target: '/vgtime/release',
            },
            {
                title: '关键词资讯',
                docs: 'https://docs.rsshub.app/game.html#you-xi-shi-guang',
                source: '/search/list.jhtml',
                target: (params, url) => `/vgtime/keyword/${new URL(url).searchParams.get('keyword')}`,
            },
        ],
    },
    'bing.com': {
        _name: 'Bing',
        www: [
            {
                title: '每日壁纸',
                docs: 'https://docs.rsshub.app/picture.html#bing-bi-zhi',
                source: '',
                target: '/bing',
            },
        ],
    },
    'dcard.tw': {
        _name: 'Dcard',
        www: [
            {
                title: '首頁帖子-最新',
                docs: 'https://docs.rsshub.app/bbs.html#dcard',
                source: '/f',
                target: '/dcard/posts/latest',
            },
            {
                title: '首頁帖子-熱門',
                docs: 'https://docs.rsshub.app/bbs.html#dcard',
                source: '/f',
                target: '/dcard/posts/popular',
            },
            {
                title: '板塊帖子-最新',
                docs: 'https://docs.rsshub.app/bbs.html#dcard',
                source: '/f/:section',
                target: '/dcard/:section/latest',
            },
            {
                title: '板塊帖子-熱門',
                docs: 'https://docs.rsshub.app/bbs.html#dcard',
                source: '/f/:section',
                target: '/dcard/:section/popular',
            },
        ],
    },
    'wegene.com': {
        _name: 'WeGene',
        www: [
            {
                title: '最近更新',
                docs: 'https://docs.rsshub.app/other.html#wegene',
                source: '',
                target: '/wegene/newest',
            },
            {
                title: '栏目',
                docs: 'https://docs.rsshub.app/other.html#wegene',
                source: '/crowdsourcing',
                target: '/wegene/column/all/all',
            },
        ],
    },
    'qdaily.com': {
        _name: '好奇心日报',
        www: [
            {
                title: '标签',
                docs: 'https://docs.rsshub.app/new-media.html#hao-qi-xin-ri-bao',
                source: '/tags/:idd',
                target: (params) => `/qdaily/tag/${params.idd.replace('.html', '')}`,
            },
            {
                title: '栏目',
                docs: 'https://docs.rsshub.app/new-media.html#hao-qi-xin-ri-bao',
                source: '/special_columns/:idd',
                target: (params) => `/qdaily/column/${params.idd.replace('.html', '')}`,
            },
            {
                title: '分类',
                docs: 'https://docs.rsshub.app/new-media.html#hao-qi-xin-ri-bao',
                source: '/categories/:idd',
                target: (params) => `/qdaily/category/${params.idd.replace('.html', '')}`,
            },
        ],
    },

    '3ycy.com': {
        _name: '三界异次元',
        www: [
            {
                title: '最近更新',
                docs: 'https://docs.rsshub.app/anime.html#san-jie-yi-ci-yuan',
                source: '/',
                target: '/3ycy/home',
            },
        ],
    },

    'emi-nitta.net': {
        _name: 'Emi Nitta',
        '.': [
            {
                title: '最近更新',
                docs: 'https://docs.rsshub.app/other.html#xin-tian-hui-hai-guan-fang-wang-zhan',
                source: '/updates',
                target: '/emi-nitta/updates',
            },
            {
                title: '新闻',
                docs: 'https://docs.rsshub.app/other.html#xin-tian-hui-hai-guan-fang-wang-zhan',
                source: '/contents/news',
                target: '/emi-nitta/news',
            },
        ],
    },

    'alter-shanghai.cn': {
        _name: 'Alter',
        '.': [
            {
                title: '新闻',
                docs: 'https://docs.rsshub.app/shopping.html#alter-zhong-guo',
                source: '/cn/news.html',
                target: '/alter-cn/news',
            },
        ],
    },

    'itslide.com': {
        _name: 'ITSlide',
        www: [
            {
                title: '最新',
                docs: 'https://docs.rsshub.app/programming.html#itslide',
                source: '/*',
                target: '/itslide/new',
            },
        ],
    },

    'leboncoin.fr': {
        _name: 'leboncoin',
        www: [
            {
                title: 'ads',
                docs: 'https://docs.rsshub.app/en/shopping.html#leboncoin',
                source: '/recherche',
                target: (params, url) => '/leboncoin/ad/' + url.split('?')[1],
            },
        ],
    },

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

    'chinatimes.com': {
        _name: '中時電子報',
        www: [
            {
                title: '新聞',
                docs: 'https://docs.rsshub.app/traditional-media.html#zhong-shi-dian-zi-bao',
                source: '/:caty',
                target: (params) => '/chinatimes/' + params.caty,
            },
        ],
    },

    'ithome.com': {
        _name: 'IT 之家',
        it: [
            {
                title: 'IT 资讯',
                docs: 'https://docs.rsshub.app/new-media.html#it-zhi-jia',
                source: '/',
                target: '/ithome/it',
            },
        ],
        soft: [
            {
                title: '软件之家',
                docs: 'https://docs.rsshub.app/new-media.html#it-zhi-jia',
                source: '/',
                target: '/ithome/soft',
            },
        ],
        win10: [
            {
                title: 'win10 之家',
                docs: 'https://docs.rsshub.app/new-media.html#it-zhi-jia',
                source: '/',
                target: '/ithome/win10',
            },
        ],
        iphone: [
            {
                title: 'iphone 之家',
                docs: 'https://docs.rsshub.app/new-media.html#it-zhi-jia',
                source: '/',
                target: '/ithome/iphone',
            },
        ],
        ipad: [
            {
                title: 'ipad 之家',
                docs: 'https://docs.rsshub.app/new-media.html#it-zhi-jia',
                source: '/',
                target: '/ithome/ipad',
            },
        ],
        android: [
            {
                title: 'android 之家',
                docs: 'https://docs.rsshub.app/new-media.html#it-zhi-jia',
                source: '/',
                target: '/ithome/android',
            },
        ],
        digi: [
            {
                title: '数码之家',
                docs: 'https://docs.rsshub.app/new-media.html#it-zhi-jia',
                source: '/',
                target: '/ithome/digi',
            },
        ],
        next: [
            {
                title: '智能时代',
                docs: 'https://docs.rsshub.app/new-media.html#it-zhi-jia',
                source: '/',
                target: '/ithome/next',
            },
        ],
    },

    'govopendata.com': {
        _name: '新闻联播文字版',
        cn: [
            {
                title: '新闻联播文字版',
                docs: 'https://docs.rsshub.app/traditional-media.html#xin-wen-lian-bo-wen-zi-ban',
                source: '/xinwenlianbo',
                target: '/xinwenlianbo/index',
            },
        ],
    },

    'steampowered.com': {
        _name: 'Steam',
        store: [
            {
                title: 'search',
                docs: 'https://docs.rsshub.app/game.html#steam',
                source: '/search/',
                target: (params, url) => `/steam/search/${new URL(url).searchParams}`,
            },
            {
                title: 'news',
                docs: 'https://docs.rsshub.app/game.html#steam',
                source: '/news/',
                target: (params, url) => `/steam/news/${new URL(url).searchParams.get('appids')}`,
            },
        ],
    },
    'baijingapp.com': {
        _name: '白鲸出海',
        www: [
            {
                title: '文章',
                docs: 'https://docs.rsshub.app/new-media.html#bai-jing-chu-hai',
                source: '',
                target: '/baijing',
            },
        ],
    },
    'xiaomi.cn': {
        _name: '小米社区',
        www: [
            {
                title: '圈子',
                docs: 'https://docs.rsshub.app/bbs.html#xiao-mi-she-qu',
                source: '/board/:boardId',
                target: '/mi/bbs/board/:boardId',
            },
        ],
    },
    '163.com': {
        _name: '网易',
        ds: [
            {
                title: '大神',
                docs: 'https://docs.rsshub.app/game.html#wang-yi-da-shen',
                source: '/user/:id',
                target: '/netease/ds/:id',
            },
        ],
        open: [
            {
                title: '公开课 - 精品课程',
                docs: 'https://docs.rsshub.app/study.html#wang-yi-gong-kai-ke',
                source: '/',
                target: '/open163/vip',
            },
            {
                title: '公开课 - 最新课程',
                docs: 'https://docs.rsshub.app/study.html#wang-yi-gong-kai-ke',
                source: '/',
                target: '/open163/latest',
            },
        ],
    },
    'suzhou.gov.cn': {
        _name: '苏州市政府',
        www: [
            {
                title: '政府新闻',
                docs: 'https://docs.rsshub.app/government.html#su-zhou-shi-ren-min-zheng-fu',
                source: '/szsrmzf/:uid/nav_list.shtml',
                target: '/gov/suzhou/news/:uid',
            },
        ],
    },
    'mqube.net': {
        _name: 'MQube',
        www: [
            {
                title: '全站最近更新',
                docs: 'https://docs.rsshub.app/multimedia.html#mqube',
                source: '/',
                target: '/mqube/latest',
            },
            {
                title: '全站每日排行',
                docs: 'https://docs.rsshub.app/multimedia.html#mqube',
                source: '/',
                target: '/mqube/top',
            },
            {
                title: '个人最近更新',
                docs: 'https://docs.rsshub.app/multimedia.html#mqube',
                source: '/user/:user',
                target: '/mqube/user/:user',
            },
            {
                title: '标签最近更新',
                docs: 'https://docs.rsshub.app/multimedia.html#mqube',
                source: '/search/tag/:tag',
                target: '/mqube/tag/:tag',
            },
        ],
    },
    'nikkei.com': {
        _name: '日本経済新聞',
        www: [
            {
                title: 'ホームページ',
                docs: 'https://docs.rsshub.app/traditional-media.html#ri-ben-jing-ji-xin-wen',
                source: '/',
                target: '/nikkei/index',
            },
        ],
    },
    'last.fm': {
        _name: 'Last.fm',
        www: [
            {
                title: '用户播放记录',
                docs: 'https://docs.rsshub.app/multimedia.html#last-fm',
                source: ['/user/:user', '/user/:user/*'],
                target: '/lastfm/recent/:user',
            },
            {
                title: '用户 Love 记录',
                docs: 'https://docs.rsshub.app/multimedia.html#last-fm',
                source: ['/user/:user', '/user/:user/*'],
                target: '/lastfm/loved/:user',
            },
            {
                title: '站内 Top 榜单',
                docs: 'https://docs.rsshub.app/multimedia.html#last-fm',
                source: '/charts',
                target: '/lastfm/top',
            },
        ],
    },
    'ddrk.me': {
        _name: '低端影视',
        www: [
            {
                title: '首页',
                docs: 'https://docs.rsshub.app/multimedia.html#di-duan-ying-shi',
                source: '/',
                target: '/ddrk/index',
            },
            {
                title: '标签',
                docs: 'https://docs.rsshub.app/multimedia.html#di-duan-ying-shi',
                source: '/tag/:tag',
                target: '/ddrk/tag/:tag',
            },
            {
                title: '分类',
                docs: 'https://docs.rsshub.app/multimedia.html#di-duan-ying-shi',
                source: ['/category/:category', '/category/:uplevel/:category'],
                target: '/ddrk/category/:category',
            },
            {
                title: '影视剧集更新',
                docs: 'https://docs.rsshub.app/multimedia.html#di-duan-ying-shi',
                source: ['/:name', '/:name/:season'],
                target: (params) => `/ddrk/update/${params.name}${params.season ? '/' + params.season : ''}`,
                verification: (params) => params.name !== 'category' && params.name !== 'tag' && params.name !== 'ddrklogin' && params.name !== 'about' && params.name !== 'deleted',
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
                target: '/google/album/:id',
                script: "({id: document.querySelector('html').innerHTML.match(/photos.app.goo.gl\\/(.*?)\"/)[1]})",
            },
        ],
    },
    'javlibrary.com': {
        _name: 'javlibrary',
        www: [
            {
                title: '新话题',
                docs: 'https://docs.rsshub.app/multimedia.html#javlibrary',
                source: '/cn',
                target: '/javlibrary/videos/update',
            },
            {
                title: '新发行',
                docs: 'https://docs.rsshub.app/multimedia.html#javlibrary',
                source: '/cn',
                target: '/javlibrary/videos/newrelease',
            },
            {
                title: '新加入',
                docs: 'https://docs.rsshub.app/multimedia.html#javlibrary',
                source: '/cn',
                target: '/javlibrary/videos/newentries',
            },
            {
                title: '最想要',
                docs: 'https://docs.rsshub.app/multimedia.html#javlibrary',
                source: '/cn',
                target: '/javlibrary/videos/mostwanted',
            },
            {
                title: '高评价',
                docs: 'https://docs.rsshub.app/multimedia.html#javlibrary',
                source: '/cn',
                target: '/javlibrary/videos/bestrated',
            },
            {
                title: '最佳评论',
                docs: 'https://docs.rsshub.app/multimedia.html#javlibrary',
                source: '/cn',
                target: '/javlibrary/bestreviews',
            },
            {
                title: '影星',
                docs: 'https://docs.rsshub.app/multimedia.html#javlibrary',
                source: '/cn/vl_star.php',
                target: (params, url) => `/javlibrary/stars/${new URL(url).searchParams.get('s')}`,
            },
            {
                title: '用户文章',
                docs: 'https://docs.rsshub.app/multimedia.html#javlibrary',
                source: ['/cn/user.php', '/cn/userposts.php', '/cn/userwateched.php', '/cn/userowned.php', '/cn/userwanted.php'],
                target: (params, url) => `/javlibrary/users/${new URL(url).searchParams.get('u')}/userposts`,
            },
            {
                title: '用户拥有',
                docs: 'https://docs.rsshub.app/multimedia.html#javlibrary',
                source: ['/cn/user.php', '/cn/userposts.php', '/cn/userwateched.php', '/cn/userowned.php', '/cn/userwanted.php'],
                target: (params, url) => `/javlibrary/users/${new URL(url).searchParams.get('u')}/userowned`,
            },
            {
                title: '用户看过',
                docs: 'https://docs.rsshub.app/multimedia.html#javlibrary',
                source: ['/cn/user.php', '/cn/userposts.php', '/cn/userwateched.php', '/cn/userowned.php', '/cn/userwanted.php'],
                target: (params, url) => `/javlibrary/users/${new URL(url).searchParams.get('u')}/userwatched`,
            },
            {
                title: '用户想要',
                docs: 'https://docs.rsshub.app/multimedia.html#javlibrary',
                source: ['/cn/user.php', '/cn/userposts.php', '/cn/userwateched.php', '/cn/userowned.php', '/cn/userwanted.php'],
                target: (params, url) => `/javlibrary/users/${new URL(url).searchParams.get('u')}/userwanted`,
            },
        ],
    },
    'qidian.com': {
        _name: '起点',
        book: [
            {
                title: '章节',
                docs: 'https://docs.rsshub.app/reading.html#qi-dian',
                source: '/info/:id',
                target: '/qidian/chapter/:id',
            },
            {
                title: '讨论区',
                docs: 'https://docs.rsshub.app/reading.html#qi-dian',
                source: '/info/:id',
                target: '/qidian/forum/:id',
            },
        ],
        www: [
            {
                title: '限免',
                docs: 'https://docs.rsshub.app/reading.html#qi-dian',
                source: '/free',
                target: '/qidian/free',
            },
            {
                title: '女生限免',
                docs: 'https://docs.rsshub.app/reading.html#qi-dian',
                source: '/mm/free',
                target: '/qidian/free/mm',
            },
        ],
    },
    'hackerone.com': {
        _name: 'HackerOne',
        '.': [
            {
                title: 'HackerOne Hacker Activity',
                docs: 'https://docs.rsshub.app/other.html#hackerone-hacker-activity',
                source: '/hacktivity',
                target: '/hackerone/hacktivity',
            },
        ],
    },
    'cowlevel.net': {
        _name: '奶牛关',
        '.': [
            {
                title: '元素文章',
                docs: 'https://docs.rsshub.app/game.html#nai-niu-guan',
                source: ['/element/:id', '/element/:id/article'],
                target: '/cowlevel/element/:id',
            },
        ],
    },
    'beijing.gov.cn': {
        wjw: [
            {
                title: '北京卫生健康委员会',
                docs: 'https://docs.rsshub.app/government.html#bei-jing-shi-wei-sheng-jian-kang-wei-yuan-hui',
                source: '/xwzx_20031/:caty',
                target: '/gov/beijing/mhc/:caty',
            },
        ],
    },
    'zju.edu.cn': {
        _name: '浙江大学',
        cst: [
            {
                title: '软件学院 - 全部通知',
                docs: 'https://docs.rsshub.app/university.html#zhe-jiang-da-xue',
                source: ['', '/*tpath'],
                target: '/universities/zju/cst/0',
            },
            {
                title: '软件学院 - 招生信息',
                docs: 'https://docs.rsshub.app/university.html#zhe-jiang-da-xue',
                source: '/32178/list.htm',
                target: '/universities/zju/cst/1',
            },
            {
                title: '软件学院 - 教务管理',
                docs: 'https://docs.rsshub.app/university.html#zhe-jiang-da-xue',
                source: '/36216/list.htm',
                target: '/universities/zju/cst/2',
            },
            {
                title: '软件学院 - 论文管理',
                docs: 'https://docs.rsshub.app/university.html#zhe-jiang-da-xue',
                source: '/36217/list.htm',
                target: '/universities/zju/cst/3',
            },
            {
                title: '软件学院 - 思政工作',
                docs: 'https://docs.rsshub.app/university.html#zhe-jiang-da-xue',
                source: '/36192/list.htm',
                target: '/universities/zju/cst/4',
            },
            {
                title: '软件学院 - 评奖评优',
                docs: 'https://docs.rsshub.app/university.html#zhe-jiang-da-xue',
                source: '/36228/list.htm',
                target: '/universities/zju/cst/5',
            },
            {
                title: '软件学院 - 实习就业',
                docs: 'https://docs.rsshub.app/university.html#zhe-jiang-da-xue',
                source: '/36193/list.htm',
                target: '/universities/zju/cst/6',
            },
            {
                title: '软件学院 - 国际实习',
                docs: 'https://docs.rsshub.app/university.html#zhe-jiang-da-xue',
                source: '/36235/list.htm',
                target: '/universities/zju/cst/7',
            },
            {
                title: '软件学院 - 国内合作科研',
                docs: 'https://docs.rsshub.app/university.html#zhe-jiang-da-xue',
                source: '/36194/list.htm',
                target: '/universities/zju/cst/8',
            },
            {
                title: '软件学院 - 国际合作科研',
                docs: 'https://docs.rsshub.app/university.html#zhe-jiang-da-xue',
                source: '/36246/list.htm',
                target: '/universities/zju/cst/9',
            },
        ],
    },
    'kuaidi100.com': {
        _name: '快递100',
        '.': [
            {
                title: '快递追踪',
                docs: 'https://docs.rsshub.app/other.html#kuai-di-100',
                source: '/',
                target: (params) => `/kuaidi100/track/${params.com}/${params.postid}`,
                script: "({postid: document.querySelector('#postid').value, com: document.querySelector('#selectComBtn').childNodes[1].attributes[1].value})",
                verification: (params) => params.com !== 'default' && params.postid,
            },
            {
                title: '支持的快递公司列表',
                docs: 'https://docs.rsshub.app/other.html#kuai-di-100',
                source: '/',
                target: '/kuaidi100/company',
            },
        ],
    },
});
