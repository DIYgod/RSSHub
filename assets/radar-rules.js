({
    'algocasts.io': {
        '.': [
            {
                docs: 'https://docs.rsshub.app/programming.html#algocasts',
                source: '/episodes',
                target: '/algocasts',
                title: '视频更新',
            },
        ],
        _name: 'AlgoCasts',
    },
    'anime1.me': {
        '.': [
            {
                docs: 'https://docs.rsshub.app/anime.html#anime1',
                source: '/category/:time/:name',
                target: '/anime1/anime/:time/:name',
                title: '動畫',
            },
            {
                docs: 'https://docs.rsshub.app/anime.html#anime1',
                script: "({keyword: new URLSearchParams(location.search).get('s')})",
                source: '/',
                target: '/anime1/search/:keyword',
                title: '搜尋',
                verification: (params) => params.keyword,
            },
        ],
        _name: 'Anime1',
    },
    'bilibili.com': {
        _name: 'bilibili',
        space: [
            {
                docs: 'https://docs.rsshub.app/social-media.html#bilibili',
                source: '/:uid',
                target: '/bilibili/user/dynamic/:uid',
                title: 'UP 主动态',
            },
            {
                docs: 'https://docs.rsshub.app/social-media.html#bilibili',
                source: '/:uid',
                target: '/bilibili/user/video/:uid',
                title: 'UP 主投稿',
            },
        ],
        www: [
            {
                docs: 'https://docs.rsshub.app/social-media.html#bilibili',
                source: ['/v/*tpath', '/documentary', '/movie', '/tv'],
                title: '分区视频',
            },
            {
                docs: 'https://docs.rsshub.app/social-media.html#bilibili',
                source: '/video/:aid',
                target: (params) => `/bilibili/video/reply/${params.aid.replace('av', '')}`,
                title: '视频评论',
            },
            {
                docs: 'https://docs.rsshub.app/social-media.html#bilibili',
                source: '/video/:aid',
                target: (params, url) => {
                    const pid = new URL(url).searchParams.get('p');
                    return `/bilibili/video/danmaku/${params.aid.replace('av', '')}/${pid ? pid : 1}`;
                },
                title: '视频弹幕',
            },
        ],
    },
    'github.com': {
        '.': [
            {
                docs: 'https://docs.rsshub.app/programming.html#github',
                source: '/:user',
                target: '/github/repos/:user',
                title: '用户仓库',
            },
            {
                docs: 'https://docs.rsshub.app/programming.html#github',
                source: '/:user',
                target: '/github/user/followers/:user',
                title: '用户 Followers',
            },
            {
                docs: 'https://docs.rsshub.app/programming.html#github',
                source: '/trending',
                target: '/github/trending/:since',
                title: 'Trending',
            },
            {
                docs: 'https://docs.rsshub.app/programming.html#github',
                source: ['/:user/:repo/issues', '/:user/:repo/issues/:id', '/:user/:repo'],
                target: '/github/issue/:user/:repo',
                title: '仓库 Issue',
            },
            {
                docs: 'https://docs.rsshub.app/programming.html#github',
                source: ['/:user/:repo/pulls', '/:user/:repo/pulls/:id', '/:user/:repo'],
                target: '/github/pull/:user/:repo',
                title: '仓库 Pull Requests',
            },
            {
                docs: 'https://docs.rsshub.app/programming.html#github',
                source: ['/:user/:repo/stargazers', '/:user/:repo'],
                target: '/github/stars/:user/:repo',
                title: '仓库 Stars',
            },
            {
                docs: 'https://docs.rsshub.app/programming.html#github',
                source: ['/:user/:repo/branches', '/:user/:repo'],
                target: '/github/branches/:user/:repo',
                title: '仓库 Branches',
            },
            {
                docs: 'https://docs.rsshub.app/programming.html#github',
                source: '/:user/:repo/blob/:branch/*filepath',
                target: '/github/file/:user/:repo/:branch/:filepath',
                title: '文件 Commits',
            },
            {
                docs: 'https://docs.rsshub.app/programming.html#github',
                source: '/:user',
                target: '/github/starred_repos/:user',
                title: '用户 Starred Repositories',
            },
        ],
        _name: 'GitHub',
    },
    'haimaoba.com': {
        _name: '海猫吧',
        www: [
            {
                docs: 'https://docs.rsshub.app/anime.html#%E6%B5%B7%E7%8C%AB%E5%90%A7',
                source: '/catalog/:id',
                target: '/haimaoba/:id',
                title: '漫画更新',
            },
        ],
    },
    'instagram.com': {
        _name: 'Instagram',
        www: [
            {
                docs: 'https://docs.rsshub.app/social-media.html#instagram',
                source: '/:id',
                target: '/instagram/user/:id',
                title: '用户',
                verification: (params) => params.id !== 'explore' && params.id !== 'developer',
            },
            {
                docs: 'https://docs.rsshub.app/social-media.html#instagram',
                source: '/explore/tags/:tag',
                target: '/instagram/tag/:tag',
                title: '标签',
            },
        ],
    },
    'ishuhui.com': {
        _name: '鼠绘漫画',
        www: [
            {
                docs: 'https://docs.rsshub.app/anime.html#%E9%BC%A0%E7%BB%98%E6%BC%AB%E7%94%BB',
                source: '/comics/anime/:id',
                target: '/shuhui/comics/:id',
                title: '鼠绘漫画',
            },
        ],
    },
    'juejin.im': {
        '.': [
            {
                docs: 'https://docs.rsshub.app/programming.html#%E6%8E%98%E9%87%91',
                source: '/user/:id/posts',
                target: '/juejin/posts/:id',
                title: '专栏',
            },
        ],
        _name: '掘金',
    },
    'pgyer.com': {
        _name: '蒲公英应用分发',
        www: [
            {
                docs: 'https://docs.rsshub.app/%E8%92%B2%E5%85%AC%E8%8B%B1%E5%BA%94%E7%94%A8%E5%88%86%E5%8F%91',
                source: '/:app',
                target: '/pgyer/:app',
                title: 'app更新',
            },
        ],
    },
    'pixiv.net': {
        _name: 'Pixiv',
        www: [
            {
                docs: 'https://docs.rsshub.app/social-media.html#pixiv',
                source: '/bookmark.php',
                target: (params, url) => `/pixiv/user/bookmarks/${new URL(url).searchParams.get('id')}`,
                title: '用户收藏',
            },
            {
                docs: 'https://docs.rsshub.app/social-media.html#pixiv',
                source: '/member.php',
                target: (params, url) => `/pixiv/user/${new URL(url).searchParams.get('id')}`,
                title: '用户动态',
            },
            {
                docs: 'https://docs.rsshub.app/social-media.html#pixiv',
                source: '/ranking.php',
                title: '排行榜',
            },
            {
                docs: 'https://docs.rsshub.app/social-media.html#pixiv',
                source: '/search.php',
                title: '关键词',
            },
            {
                docs: 'https://docs.rsshub.app/social-media.html#pixiv',
                source: '/bookmark_new_illust.php',
                target: '/pixiv/user/illustfollows',
                title: '关注的新作品',
            },
        ],
    },
    'rsshub.app': {
        _name: 'RSSHub',
        docs: [
            {
                docs: 'https://docs.rsshub.app/program-update.html#rsshub',
                source: ['', '/*tpath'],
                target: '/rsshub/rss',
                title: '有新路由啦',
            },
        ],
    },
    'smzdm.com': {
        _name: '什么值得买',
        www: [
            {
                docs: 'https://docs.rsshub.app/shopping.html#%E4%BB%80%E4%B9%88%E5%80%BC%E5%BE%97%E4%B9%B0',
                target: '/smzdm/keyword/:keyword',
                title: '关键词',
            },
            {
                docs: 'https://docs.rsshub.app/shopping.html#%E4%BB%80%E4%B9%88%E5%80%BC%E5%BE%97%E4%B9%B0',
                source: '/top',
                title: '排行榜',
            },
        ],
    },
    'soulapp.cn': {
        '.': [
            {
                docs: 'https://docs.rsshub.app/social-media.html#soul',
                title: '瞬间更新',
            },
        ],
        _name: 'Soul',
    },
    'swufe.edu.cn': {
        _name: '西南财经大学',
        it: [
            {
                docs: 'https://docs.rsshub.app/university.html#%E7%BB%8F%E6%B5%8E%E4%BF%A1%E6%81%AF%E5%B7%A5%E7%A8%8B%E5%AD%A6%E9%99%A2',
                source: '/index/tzgg.htm',
                target: '/universities/swufe/seie/tzgg',
                title: '经济信息工程学院 - 通知公告',
            },
            {
                docs: 'https://docs.rsshub.app/university.html#%E7%BB%8F%E6%B5%8E%E4%BF%A1%E6%81%AF%E5%B7%A5%E7%A8%8B%E5%AD%A6%E9%99%A2',
                source: '/index/xyxw.htm',
                target: '/universities/swufe/seie/xyxw',
                title: '经济信息工程学院 - 学院新闻',
            },
        ],
    },
    'twitter.com': {
        '.': [
            {
                docs: 'https://docs.rsshub.app/social-media.html#twitter',
                source: '/:id',
                target: '/twitter/user/:id',
                title: '用户时间线',
                verification: (params) => params.id !== 'home' && params.id !== 'explore' && params.id !== 'notifications' && params.id !== 'messages' && params.id !== 'explore',
            },
            {
                docs: 'https://docs.rsshub.app/social-media.html#twitter',
                source: '/:id',
                target: '/twitter/followings/:id',
                title: '用户关注时间线',
                verification: (params) => params.id !== 'home' && params.id !== 'explore' && params.id !== 'notifications' && params.id !== 'messages' && params.id !== 'explore',
            },
            {
                docs: 'https://docs.rsshub.app/social-media.html#twitter',
                source: '/:id',
                target: '/twitter/likes/:id',
                title: '用户喜欢列表',
                verification: (params) => params.id !== 'home' && params.id !== 'explore' && params.id !== 'notifications' && params.id !== 'messages' && params.id !== 'explore',
            },
            {
                docs: 'https://docs.rsshub.app/social-media.html#twitter',
                source: '/:id/lists/:name',
                target: '/twitter/list/:id/:name',
                title: '列表时间线',
                verification: (params) => params.id !== 'home' && params.id !== 'explore' && params.id !== 'notifications' && params.id !== 'messages' && params.id !== 'explore',
            },
        ],
        _name: 'Twitter',
    },
    'weibo.com': {
        '.': [
            {
                docs: 'https://docs.rsshub.app/social-media.html#%E5%BE%AE%E5%8D%9A',
                script: "({uid: document.querySelector('head').innerHTML.match(/\\$CONFIG\\['oid']='(\\d+)'/)[1]})",
                source: ['/u/:id', '/:id'],
                target: '/weibo/user/:uid',
                title: '博主',
                verification: (params) => params.uid,
            },
        ],
        _name: '微博',
    },
    'ximalaya.com': {
        _name: '喜马拉雅',
        www: [
            {
                docs: 'https://docs.rsshub.app/multimedia.html#%E5%96%9C%E9%A9%AC%E6%8B%89%E9%9B%85',
                source: '/:type/:id',
                target: '/ximalaya/album/:id/',
                title: '专辑',
                verification: (params) => parseInt(params.id) + '' === params.id,
            },
        ],
    },
    'yimg.net': {
        _name: 'Y图',
        www: [
            {
                docs: 'https://docs.rsshub.app/picture.html#y-%25E5%259B%25BE',
                source: '/*path',
                target: (params) => `/yimg/${params.path.replace('/', '_')}`,
                title: '',
            },
        ],
    },
    'youtube.com': {
        _name: 'Youtube',
        www: [
            {
                docs: 'https://docs.rsshub.app/social-media.html#youtube',
                source: '/user/:username',
                target: '/youtube/user/:username',
                title: '用户',
            },
            {
                docs: 'https://docs.rsshub.app/social-media.html#youtube',
                source: '/channel/:id',
                target: '/youtube/channel/:id',
                title: '频道',
            },
            {
                docs: 'https://docs.rsshub.app/social-media.html#youtube',
                source: '/playlist',
                target: (params, url) => `/youtube/playlist/${new URL(url).searchParams.get('list')}`,
                title: '播放列表',
            },
        ],
    },
    'zhihu.com': {
        _name: '知乎',
        daily: [
            {
                docs: 'https://docs.rsshub.app/social-media.html#%E7%9F%A5%E4%B9%8E',
                source: '',
                target: '/zhihu/daily',
                title: '日报',
            },
            {
                docs: 'https://docs.rsshub.app/social-media.html#%E7%9F%A5%E4%B9%8E',
                source: '/*tpath',
                target: '/zhihu/daily',
                title: '日报',
            },
        ],
        www: [
            {
                docs: 'https://docs.rsshub.app/social-media.html#%E7%9F%A5%E4%B9%8E',
                source: '/collection/:id',
                target: '/zhihu/collection/:id',
                title: '收藏夹',
            },
            {
                docs: 'https://docs.rsshub.app/social-media.html#%E7%9F%A5%E4%B9%8E',
                source: '/people/:id/activities',
                target: '/zhihu/people/activities/:id',
                title: '用户动态',
            },
            {
                docs: 'https://docs.rsshub.app/social-media.html#%E7%9F%A5%E4%B9%8E',
                source: '/people/:id/answers',
                target: '/zhihu/people/answers/:id',
                title: '用户回答',
            },
            {
                docs: 'https://docs.rsshub.app/social-media.html#%E7%9F%A5%E4%B9%8E',
                source: '/people/:id/pins',
                target: '/zhihu/people/pins/:id',
                title: '用户想法',
            },
            {
                docs: 'https://docs.rsshub.app/social-media.html#%E7%9F%A5%E4%B9%8E',
                source: '/hot',
                target: '/zhihu/hotlist',
                title: '热榜',
            },
            {
                docs: 'https://docs.rsshub.app/social-media.html#%E7%9F%A5%E4%B9%8E',
                target: '/zhihu/pin/hotlist',
                title: '想法热榜',
            },
            {
                docs: 'https://docs.rsshub.app/social-media.html#%E7%9F%A5%E4%B9%8E',
                source: '/question/:questionId',
                target: '/zhihu/question/:questionId',
                title: '问题',
            },
            {
                docs: 'https://docs.rsshub.app/social-media.html#%E7%9F%A5%E4%B9%8E',
                source: '/topic/:topicId/:type',
                target: '/zhihu/topic/:topicId',
                title: '话题',
            },
            {
                docs: 'https://docs.rsshub.app/social-media.html#%E7%9F%A5%E4%B9%8E',
                source: '/zhihu/bookstore/newest',
                target: '/zhihu/pin/hotlist',
                title: '新书',
            },
            {
                docs: 'https://docs.rsshub.app/social-media.html#%E7%9F%A5%E4%B9%8E',
                source: '/pin/special/972884951192113152',
                target: '/zhihu/pin/daily',
                title: '想法-24 小时新闻汇总',
            },
            {
                docs: 'https://docs.rsshub.app/social-media.html#%E7%9F%A5%E4%B9%8E',
                source: '/pub/weekly',
                target: '/zhihu/weekly',
                title: '书店-周刊',
            },
        ],
        zhuanlan: [
            {
                docs: 'https://docs.rsshub.app/social-media.html#%E7%9F%A5%E4%B9%8E',
                source: '/:id',
                target: '/zhihu/zhuanlan/:id',
                title: '专栏',
            },
        ],
    },
});
