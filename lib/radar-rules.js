module.exports = {
    'weibo.com': {
        _name: '微博',
        '.': [
            {
                title: '博主',
                docs: 'https://docs.rsshub.app/social-media.html#wei-bo',
                source: ['/u/:id', '/:id'],
                target: (params, url, document) => {
                    let uid = document?.documentElement.innerHTML.match(/\$CONFIG\['oid']='(\d+)'/)?.[1];
                    if (!uid && !isNaN(params.id)) {
                        uid = params.id;
                    }
                    return uid ? `/weibo/user/${uid}` : '';
                },
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
    'weibo.cn': {
        _name: '微博',
        m: [
            {
                title: '博主',
                docs: 'https://docs.rsshub.app/social-media.html#wei-bo',
                source: ['/u/:uid', '/profile/:uid'],
                target: '/weibo/user/:uid',
            },
        ],
    },
    'pixiv.net': {
        _name: 'Pixiv',
        www: [
            {
                title: '用户收藏',
                docs: 'https://docs.rsshub.app/social-media.html#pixiv',
                source: '/users/:id/bookmarks/artworks',
                target: '/pixiv/user/bookmarks/:id',
            },
            {
                title: '用户动态',
                docs: 'https://docs.rsshub.app/social-media.html#pixiv',
                source: '/users/:id',
                target: '/pixiv/user/:id',
            },
            {
                title: '排行榜',
                docs: 'https://docs.rsshub.app/social-media.html#pixiv',
                source: '/ranking.php',
                target: (params, url) => `/pixiv/ranking/${new URL(url).searchParams.get('mode') || 'daily'}`,
            },
            {
                title: '关键词',
                docs: 'https://docs.rsshub.app/social-media.html#pixiv',
                source: ['/tags/:keyword', '/tags/:keyword/:type?'],
                target: (params, url) => `/pixiv/search/:keyword/${new URL(url).searchParams.get('order')}/${new URL(url).searchParams.get('mode')}`,
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
                target: (params) => {
                    if (params.id !== 'home' && params.id !== 'explore' && params.id !== 'notifications' && params.id !== 'messages' && params.id !== 'explore' && params.id !== 'search') {
                        return '/twitter/user/:id';
                    }
                },
            },
            {
                title: '用户关注时间线',
                docs: 'https://docs.rsshub.app/social-media.html#twitter',
                source: '/:id',
                target: (params) => {
                    if (params.id !== 'home' && params.id !== 'explore' && params.id !== 'notifications' && params.id !== 'messages' && params.id !== 'explore' && params.id !== 'search') {
                        return '/twitter/followings/:id';
                    }
                },
            },
            {
                title: '用户喜欢列表',
                docs: 'https://docs.rsshub.app/social-media.html#twitter',
                source: '/:id',
                target: (params) => {
                    if (params.id !== 'home' && params.id !== 'explore' && params.id !== 'notifications' && params.id !== 'messages' && params.id !== 'explore' && params.id !== 'search') {
                        return '/twitter/likes/:id';
                    }
                },
            },
            {
                title: '列表时间线',
                docs: 'https://docs.rsshub.app/social-media.html#twitter',
                source: '/:id/lists/:name',
                target: (params) => {
                    if (params.id !== 'home' && params.id !== 'explore' && params.id !== 'notifications' && params.id !== 'messages' && params.id !== 'explore' && params.id !== 'search') {
                        return '/twitter/list/:id/:name';
                    }
                },
            },
            {
                title: '关键词',
                docs: 'https://docs.rsshub.app/social-media.html#twitter',
                source: '/search',
                target: (params, url) => `/twitter/keyword/${new URL(url).searchParams.get('q')}`,
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
            {
                title: '经济信息工程学院 - 通知公告',
                docs: 'https://docs.rsshub.app/university.html#xi-nan-cai-jing-da-xue',
                source: '/index/tzgg.htm',
                target: '/swufe/seie/tzgg',
            },
            {
                title: '经济信息工程学院 - 学院新闻',
                docs: 'https://docs.rsshub.app/university.html#xi-nan-cai-jing-da-xue',
                source: '/index/xyxw.htm',
                target: '/swufe/seie/xyxw',
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
    'www.chicagotribune.com': {
        _name: 'Chicago Tribune',
        www: [
            {
                title: 'Chicago Tribune',
                docs: 'https://docs.rsshub.app/traditional_media.html#chicago-tribune',
                source: '/',
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
    'manhuagui.com': {
        _name: '漫画柜',
        www: [
            {
                title: '漫画更新',
                docs: 'https://docs.rsshub.app/anime.html#kan-man-hua',
                source: '/comic/:id/',
                target: '/manhuagui/comic/:id',
            },
        ],
    },
    'mhgui.com': {
        _name: '漫画柜镜像站',
        www: [
            {
                title: '漫画更新',
                docs: 'https://docs.rsshub.app/anime.html#kan-man-hua-jing-xiang-zhan',
                source: '/comic/:id/',
                target: '/mhgui/comic/:id',
            },
        ],
    },
    'tw.manhuagui.com': {
        _name: '漫画柜台湾',
        www: [
            {
                title: '漫画更新',
                docs: 'https://docs.rsshub.app/anime.html#kan-man-hua-tai-wan',
                source: '/comic/:id/',
                target: '/twmanhuagui/comic/:id',
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
    'baidu.com': {
        _name: '贴吧',
        tieba: [
            {
                title: '帖子列表',
                docs: 'https://docs.rsshub.app/bbs.html#tie-ba',
                source: 'f',
                target: (params, url) => {
                    const type = new URL(url).searchParams.get('tab');
                    if (!type || type === 'main') {
                        return `/tieba/forum/${new URL(url).searchParams.get('kw')}`;
                    }
                },
            },
            {
                title: '精品帖子',
                docs: 'https://docs.rsshub.app/bbs.html#tie-ba',
                source: 'f',
                target: (params, url) => {
                    const type = new URL(url).searchParams.get('tab');
                    if (type === 'good') {
                        return `/tieba/forum/good/${new URL(url).searchParams.get('kw')}`;
                    }
                },
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
            {
                title: '用户帖子',
                docs: 'https://docs.rsshub.app/bbs.html#tie-ba',
                source: '/home/main',
                target: (params, url) => {
                    const uid = new URL(url).searchParams.get('un');
                    if (uid) {
                        return `/tieba/user/${uid}`;
                    }
                },
            },
        ],
    },
    'wineyun.com': {
        _name: '酒云网',
        www: [
            {
                title: '最新商品',
                docs: 'https://docs.rsshub.app/other.html#jiu-yun-wang',
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
            {
                title: '折扣|价格',
                docs: 'https://docs.rsshub.app/game.html#playstation',
                source: ['/:lang/product/:gridName'],
                target: '/ps/:lang/product/:gridName',
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
        music: [
            {
                title: '云音乐 - 用户歌单',
                docs: 'https://docs.rsshub.app/multimedia.html#wang-yi-yun-yin-yue',
                source: '/',
                target: (params, url) => {
                    const id = new URL(url).hash.match(/home\?id=(.*)/)[1];
                    return id ? `/ncm/user/playlist/${id}` : '';
                },
            },
            {
                title: '云音乐 - 歌单歌曲',
                docs: 'https://docs.rsshub.app/multimedia.html#wang-yi-yun-yin-yue',
                source: '/',
                target: (params, url) => {
                    const id = new URL(url).hash.match(/playlist\?id=(.*)/)[1];
                    return id ? `/ncm/playlist/${id}` : '';
                },
            },
            {
                title: '云音乐 - 歌手专辑',
                docs: 'https://docs.rsshub.app/multimedia.html#wang-yi-yun-yin-yue',
                source: '/',
                target: (params, url) => {
                    const id = new URL(url).hash.match(/album\?id=(.*)/)[1];
                    return id ? `/ncm/artist/${id}` : '';
                },
            },
            {
                title: '云音乐 - 电台节目',
                docs: 'https://docs.rsshub.app/multimedia.html#wang-yi-yun-yin-yue',
                source: '/',
                target: (params, url) => {
                    const id = new URL(url).hash.match(/djradio\?id=(.*)/)[1];
                    return id ? `/ncm/djradio/${id}` : '';
                },
            },
        ],
        'y.music': [
            {
                title: '云音乐 - 用户歌单',
                docs: 'https://docs.rsshub.app/multimedia.html#wang-yi-yun-yin-yue',
                source: '/m/user',
                target: (params, url) => `/ncm/playlist/${new URL(url).searchParams.get('id')}`,
            },
            {
                title: '云音乐 - 歌单歌曲',
                docs: 'https://docs.rsshub.app/multimedia.html#wang-yi-yun-yin-yue',
                source: '/m/playlist',
                target: (params, url) => `/ncm/playlist/${new URL(url).searchParams.get('id')}`,
            },
            {
                title: '云音乐 - 歌手专辑',
                docs: 'https://docs.rsshub.app/multimedia.html#wang-yi-yun-yin-yue',
                source: '/m/album',
                target: (params, url) => `/ncm/playlist/${new URL(url).searchParams.get('id')}`,
            },
            {
                title: '云音乐 - 播单声音',
                docs: 'https://docs.rsshub.app/multimedia.html#wang-yi-yun-yin-yue',
                source: ['/m/radio', '/m/djradio'],
                target: (params, url) => `/ncm/playlist/${new URL(url).searchParams.get('id')}`,
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
        chrome: [
            {
                title: '插件更新',
                source: '/webstore/detail/:name/:id',
                docs: 'https://docs.rsshub.app/program-update.html#chrome-wang-shang-ying-yong-dian',
                target: '/chrome/webstore/extensions/:id',
            },
        ],
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
        sites: [
            {
                title: 'Sites',
                docs: 'https://docs.rsshub.app/blog.html#google-sites',
                source: ['/site/:id/*', '/site/:id'],
                target: '/google/sites/:id',
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
    'ynu.edu.cn': {
        _name: '云南大学',
        home: [
            {
                title: '官网消息通告',
                docs: 'https://docs.rsshub.app/university.html#yun-nan-da-xue',
                source: '/tzgg.htm',
                target: '/ynu/home',
            },
        ],
        jwc: [
            {
                title: '教务处教务科通知',
                docs: 'https://docs.rsshub.app/university.html#yun-nan-da-xue',
                source: '/*',
                target: '/jwc/1',
            },
            {
                title: '教务处学籍科通知',
                docs: 'https://docs.rsshub.app/university.html#yun-nan-da-xue',
                source: '/*',
                target: '/jwc/2',
            },
            {
                title: '教务处教学研究科通知',
                docs: 'https://docs.rsshub.app/university.html#yun-nan-da-xue',
                source: '/*',
                target: '/jwc/3',
            },
            {
                title: '教务处实践科学科通知',
                docs: 'https://docs.rsshub.app/university.html#yun-nan-da-xue',
                source: '/*',
                target: '/jwc/4',
            },
        ],
        grs: [
            {
                title: '研究生院通知',
                docs: 'https://docs.rsshub.app/university.html#yun-nan-da-xue',
                source: '/*',
                target: '',
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
                target: (params, url, document) => {
                    const postid = document && document.querySelector('#postid').value;
                    const com = document && document.querySelector('#selectComBtn').childNodes[1].attributes[1].value;
                    if (com && com !== 'default' && postid) {
                        return `/kuaidi100/track/${com}/${postid}`;
                    }
                },
            },
            {
                title: '支持的快递公司列表',
                docs: 'https://docs.rsshub.app/other.html#kuai-di-100',
                source: '/',
                target: '/kuaidi100/company',
            },
        ],
    },
    'hrbeu.edu.cn': {
        _name: '哈尔滨工程大学',
        yjsy: [
            {
                title: '研究生院 - 通知公告',
                docs: 'https://docs.rsshub.app/university.html#ha-er-bin-gong-cheng-da-xue',
                source: '/*',
                target: '/heu/yjsy/announcement',
            },
            {
                title: '研究生院 - 新闻动态',
                docs: 'https://docs.rsshub.app/university.html#ha-er-bin-gong-cheng-da-xue',
                source: '/*',
                target: '/heu/yjsy/news',
            },
            {
                title: '研究生院 - 国家公派项目',
                docs: 'https://docs.rsshub.app/university.html#ha-er-bin-gong-cheng-da-xue',
                source: '/*',
                target: '/heu/yjsy/gjgp',
            },
            {
                title: '研究生院 - 国际合作与交流项目',
                docs: 'https://docs.rsshub.app/university.html#ha-er-bin-gong-cheng-da-xue',
                source: '/*',
                target: '/heu/yjsy/gjhz',
            },
        ],
        job: [
            {
                title: '就业服务平台 - 通知公告',
                docs: 'https://docs.rsshub.app/university.html#ha-er-bin-gong-cheng-da-xue',
                source: '/*',
                target: '/heu/job/tzgg',
            },
        ],
        uae: [
            {
                title: '水声学院 - 新闻动态',
                docs: 'https://docs.rsshub.app/university.html#ha-er-bin-gong-cheng-da-xue',
                source: '/*',
                target: '/heu/shuisheng/xwdt',
            },
            {
                title: '研究生院 - 通知公告',
                docs: 'https://docs.rsshub.app/university.html#ha-er-bin-gong-cheng-da-xue',
                source: '/*',
                target: '/heu/shuisheng/tzgg',
            },
        ],
    },
    'gongxue.cn': {
        _name: '工学网',
        '.': [
            {
                title: '要闻',
                docs: 'https://docs.rsshub.app/university.html#ha-er-bin-gong-cheng-da-xue',
                source: '/*',
                target: '/heu/gongxue/yw',
            },
            {
                title: '时讯',
                docs: 'https://docs.rsshub.app/university.html#ha-er-bin-gong-cheng-da-xue',
                source: '/*',
                target: '/heu/gongxue/sx',
            },
        ],
    },
    // 'nsfc.gov.cn': {
    //     _name: '国家自然科学基金委员会',
    //     www: [
    //         {
    //             title: '基金要闻',
    //             docs: 'https://docs.rsshub.app/other.html#guo-jia-zi-ran-ke-xue-ji-jin-wei-yuan-hui',
    //             source: '/*',
    //             target: '/nsfc/news/jjyw',
    //         },
    //         {
    //             title: '通知公告',
    //             docs: 'https://docs.rsshub.app/other.html#guo-jia-zi-ran-ke-xue-ji-jin-wei-yuan-hui',
    //             source: '/*',
    //             target: '/nsfc/news/tzgg',
    //         },
    //         {
    //             title: '资助成果',
    //             docs: 'https://docs.rsshub.app/other.html#guo-jia-zi-ran-ke-xue-ji-jin-wei-yuan-hui',
    //             source: '/*',
    //             target: '/nsfc/news/zzcg',
    //         },
    //         {
    //             title: '科普快讯',
    //             docs: 'https://docs.rsshub.app/other.html#guo-jia-zi-ran-ke-xue-ji-jin-wei-yuan-hui',
    //             source: '/*',
    //             target: '/nsfc/news/kpkx',
    //         },
    //     ],
    // },
    'japanpost.jp': {
        _name: '日本郵便',
        'trackings.post': [
            {
                title: '郵便・荷物の追跡',
                docs: 'https://docs.rsshub.app/other.html#ri-ben-you-bian-you-bian-zhui-ji-サービス',
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
    'csc.edu.cn': {
        _name: '国家留学网',
        www: [
            {
                title: '遴选通知',
                docs: 'https://docs.rsshub.app/other.html#guo-jia-liu-xue-wang',
                source: '/*',
                target: '/csc/notice/lxtz',
            },
            {
                title: '综合项目专栏',
                docs: 'https://docs.rsshub.app/other.html#guo-jia-liu-xue-wang',
                source: '/*',
                target: '/csc/notice/xmzl',
            },
            {
                title: '常见问题解答',
                docs: 'https://docs.rsshub.app/other.html#guo-jia-liu-xue-wang',
                source: '/*',
                target: '/csc/notice/wtjd',
            },
            {
                title: '录取公告',
                docs: 'https://docs.rsshub.app/other.html#guo-jia-liu-xue-wang',
                source: '/*',
                target: '/csc/notice/lqgg',
            },
        ],
    },
    // 'biquge5200.com': {
    //     www: [
    //         {
    //             title: 'biquge5200.com',
    //             docs: 'https://docs.rsshub.app/reading.html#bi-qu-ge-biquge5200-com',
    //             source: '/:id',
    //             target: '/novel/biquge/:id',
    //         },
    //     ],
    // },
    // 'biquge.info': {
    //     www: [
    //         {
    //             title: 'biquge.info',
    //             docs: 'https://docs.rsshub.app/reading.html#bi-qu-ge-biquge-info',
    //             source: '/:id',
    //             target: '/novel/biqugeinfo/:id',
    //         },
    //     ],
    // },
    'matters.news': {
        _name: 'Matters',
        '.': [
            {
                title: '最新排序',
                docs: 'https://docs.rsshub.app/new-media.html#matters',
                source: '',
                target: '/matters/latest',
            },
            {
                title: '标签',
                docs: 'https://docs.rsshub.app/new-media.html#matters',
                source: '/tags/:tid',
                target: '/matters/tags/:tid',
            },
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
    'zhaishuyuan.com': {
        _name: '斋书苑',
        '.': [
            {
                title: '最新章节',
                docs: 'https://docs.rsshub.app/reading.html#zhai-shu-yuan',
                source: ['/book/:id', '/read/:id'],
                target: '/novel/zhaishuyuan/:id',
            },
        ],
    },
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
            {
                title: '新闻动态',
                docs: 'http://docs.rsshub.app/university.html#hu-bei-gong-ye-da-xue',
                source: '/index/xwdt.htm',
                target: '/hbut/cs/xwdt',
            },
            {
                title: '通知公告',
                docs: 'http://docs.rsshub.app/university.html#hu-bei-gong-ye-da-xue',
                source: '/index/tzgg.htm',
                target: '/hbut/cs/tzgg',
            },
            {
                title: '教学信息',
                docs: 'http://docs.rsshub.app/university.html#hu-bei-gong-ye-da-xue',
                source: '/jxxx.htm',
                target: '/hbut/cs/jxxx',
            },
            {
                title: '科研动态',
                docs: 'http://docs.rsshub.app/university.html#hu-bei-gong-ye-da-xue',
                source: '/kxyj/kydt.htm',
                target: '/hbut/cs/kydt',
            },
            {
                title: '党建活动',
                docs: 'http://docs.rsshub.app/university.html#hu-bei-gong-ye-da-xue',
                source: '/djhd/djhd.htm',
                target: '/hbut/cs/djhd',
            },
        ],
    },
    'zcool.com.cn': {
        _name: '站酷',
        www: [
            {
                title: '发现',
                docs: 'https://docs.rsshub.app/design.html#zhan-ku',
                source: '',
                target: '/zcool/discover',
            },
            {
                title: '发现 - 精选 - 全部推荐',
                docs: 'https://docs.rsshub.app/design.html#zhan-ku',
                source: '',
                target: '/zcool/discover/all',
            },
            {
                title: '发现 - 精选 - 首页推荐',
                docs: 'https://docs.rsshub.app/design.html#zhan-ku',
                source: '',
                target: '/zcool/discover/home',
            },
            {
                title: '发现 - 精选 - 编辑精选',
                docs: 'https://docs.rsshub.app/design.html#zhan-ku',
                source: '',
                target: '/zcool/discover/home',
            },
            {
                title: '发现 - 精选 - 文章 - 编辑精选',
                docs: 'https://docs.rsshub.app/design.html#zhan-ku',
                source: '',
                target: '/zcool/discover/article',
            },
            {
                title: '作品榜单',
                docs: 'https://docs.rsshub.app/design.html#zhan-ku',
                source: '',
                target: '/zcool/top/design',
            },
            {
                title: '文章榜单',
                docs: 'https://docs.rsshub.app/design.html#zhan-ku',
                source: '',
                target: '/zcool/top/article',
            },
            {
                title: '用户作品',
                docs: 'https://docs.rsshub.app/design.html#zhan-ku',
                source: ['/u/:id'],
                target: `/zcool/user/:id`,
            },
        ],
    },
    'zhuixinfan.com': {
        _name: '追新番日剧站',
        '.': [
            {
                title: '更新列表',
                docs: 'https://docs.rsshub.app/multimedia.html#zhui-xin-fan-ri-ju-zhan',
                source: ['/main.php'],
                target: '/zhuixinfan/list',
            },
        ],
    },
    'etoland.co.kr': {
        _name: 'eTOLAND',
        '.': [
            {
                title: '主题贴',
                docs: 'https://docs.rsshub.app/bbs.html#etoland',
                source: ['/bbs/board.php', '/plugin/mobile/board.php'],
                target: (params, url) => `/etoland/${new URL(url).searchParams.get('bo_table')}`,
            },
        ],
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
            {
                title: 'ECE News',
                docs: 'http://docs.rsshub.app/en/university.html#umass-amherst',
                source: '/news',
                target: '/umass/amherst/ecenews',
            },
            {
                title: 'ECE Seminar',
                docs: 'http://docs.rsshub.app/en/university.html#umass-amherst',
                source: '/seminars',
                target: '/umass/amherst/eceseminar',
            },
        ],
        'www.cics': [
            {
                title: 'CICS News',
                docs: 'http://docs.rsshub.app/en/university.html#umass-amherst',
                source: '/news',
                target: '/umass/amherst/csnews',
            },
        ],
        www: [
            {
                title: 'IPO Events',
                docs: 'http://docs.rsshub.app/en/university.html#umass-amherst',
                source: '/ipo/iss/events',
                target: '/umass/amherst/ipoevents',
            },
            {
                title: 'IPO Featured Stories',
                docs: 'http://docs.rsshub.app/en/university.html#umass-amherst',
                source: '/ipo/iss/featured-stories',
                target: '/umass/amherst/ipostories',
            },
        ],
    },
    'yuque.com': {
        _name: '语雀',
        www: [
            {
                title: '知识库',
                docs: 'https://docs.rsshub.app/study.html#yu-que',
                source: ['/:space/:book'],
                target: (params, url, document) => {
                    const match = document.documentElement.innerHTML.match(/JSON\.parse\(decodeURIComponent\("(.*)"\)/);
                    if (match && match[1]) {
                        const dataStr = match[1];
                        try {
                            const appData = JSON.parse(decodeURIComponent(dataStr));
                            return `/yuque/doc/${appData.book.id}`;
                        } catch (e) {
                            // pass
                        }
                    }
                },
            },
        ],
    },
    'bjeea.com': {
        _name: '北京考试院',
        www: [
            {
                title: '首页 / 通知公告',
                docs: 'https://docs.rsshub.app/government.html#bei-jing-jiao-yu-kao-shi-yuan',
                source: ['/html/bjeeagg'],
                target: '/gov/beijing/bjeea/bjeeagg',
            },
            {
                title: '首页 / 招考政策',
                docs: 'https://docs.rsshub.app/government.html#bei-jing-jiao-yu-kao-shi-yuan',
                source: ['/html/zkzc'],
                target: '/gov/beijing/bjeea/zkzc',
            },
            {
                title: '首页 / 自考快递',
                docs: 'https://docs.rsshub.app/government.html#bei-jing-jiao-yu-kao-shi-yuan',
                source: ['/html/zkkd'],
                target: '/gov/beijing/bjeea/zkkd',
            },
        ],
    },
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
            {
                title: '栏目',
                docs: 'https://docs.rsshub.app/government.html#guo-jia-xin-wen-chu-ban-shu',
                source: '/nppa/channels/:channel',
                target: (params, url) => `/gov/nppa/${/nppa\/channels\/(\d+)\.shtml/.exec(url)[1]}`,
            },
            {
                title: '内容',
                docs: 'https://docs.rsshub.app/government.html#guo-jia-xin-wen-chu-ban-shu',
                source: '/nppa/contents/:channel/:content',
                target: (params, url) => `/gov/nppa/${/nppa\/contents\/(\d+\/\d+)\.shtml/.exec(url)[1]}`,
            },
        ],
    },
    'jjmhw.cc': {
        _name: '漫小肆',
        www: [
            {
                title: '漫画更新',
                docs: 'https://docs.rsshub.app/anime.html#man-xiao-si',
                source: '/book/:id',
                target: '/manxiaosi/book/:id',
            },
        ],
    },
    'wenxuecity.com': {
        _name: '文学城',
        blog: [
            {
                title: '博客',
                docs: 'https://docs.rsshub.app/bbs.html#wen-xue-cheng-bo-ke',
                source: '/myblog/:id',
                target: '/wenxuecity/blog/:id',
            },
            {
                title: '博客',
                docs: 'https://docs.rsshub.app/bbs.html#wen-xue-cheng-bo-ke',
                source: '/myoverview/:id',
                target: '/wenxuecity/blog/:id',
            },
        ],
        bbs: [
            {
                title: '最新主题',
                docs: 'https://docs.rsshub.app/bbs.html#wen-xue-cheng-zui-xin-zhu-ti',
                source: '/:cat',
                target: '/wenxuecity/bbs/:cat',
            },
            {
                title: '最新主题 - 精华区',
                docs: 'https://docs.rsshub.app/bbs.html#wen-xue-cheng-zui-xin-zhu-ti',
                source: '/:cat',
                target: '/wenxuecity/bbs/:cat/1',
            },
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
    'buaq.net': {
        _name: '不安全资讯',
        '.': [
            {
                title: '不安全资讯',
                docs: 'http://docs.rsshub.app/new-media.html#bu-an-quan',
                source: '/',
                target: '/buaq',
            },
        ],
    },
    'jian-ning.com': {
        _name: '建宁闲谈',
        '.': [
            {
                title: '文章',
                docs: 'https://docs.rsshub.app/blog.html#jian-ning-xian-tan',
                source: '/*',
                target: '/blogs/jianning',
            },
        ],
    },
    'matataki.io': {
        _name: 'matataki',
        www: [
            {
                title: '最热作品',
                docs: 'https://docs.rsshub.app/new-media.html#matataki',
                source: '/article/',
                target: '/matataki/posts/hot',
            },
            {
                title: '最新作品',
                docs: 'https://docs.rsshub.app/new-media.html#matataki',
                source: '/article/latest',
                target: '/matataki/posts/latest',
            },
            {
                title: '作者创作',
                docs: 'https://docs.rsshub.app/new-media.html#matataki',
                source: '/user/:uid',
                target: (params) => `/matataki/users/${params.uid}/posts`,
            },
            {
                title: 'Fan票关联作品',
                docs: 'https://docs.rsshub.app/new-media.html#matataki',
                source: ['/token/:tokenId', '/token/:tokenId/circle'],
                target: (params) => `/matataki/tokens/${params.tokenId}/posts`,
            },
            {
                title: '标签关联作品',
                docs: 'https://docs.rsshub.app/new-media.html#matataki',
                source: ['/tag/:tagId'],
                target: (params, url) => {
                    const tagName = new URL(url).searchParams.get('name');
                    return `/matataki/tags/${params.tagId}/${tagName}/posts`;
                },
            },
            {
                title: '收藏夹',
                docs: 'https://docs.rsshub.app/new-media.html#matataki',
                source: '/user/:uid/favlist/:fid',
                target: (params) => `/matataki/users/${params.uid}/favorites/${params.fid}/posts`,
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
                target: (params) => {
                    if (params.id !== 'explore' && params.id !== 'developer') {
                        return '/instagram/user/:id';
                    }
                },
            },
        ],
    },
    'huya.com': {
        _name: '虎牙直播',
        '.': [
            {
                title: '直播间开播',
                docs: 'https://docs.rsshub.app/live.html#hu-ya-zhi-bo-zhi-bo-jian-kai-bo',
                source: '/:id',
                target: '/huya/live/:id',
            },
        ],
    },
    'craigslist.org': {
        _name: 'Craigslist',
        '.': [
            {
                title: '商品搜索列表',
                docs: 'https://docs.rsshub.app/shopping.html#craigslist',
            },
        ],
    },
    'saraba1st.com': {
        _name: 'Saraba1st',
        bbs: [
            {
                title: '帖子',
                docs: 'https://docs.rsshub.app/bbs.html#saraba1st',
                source: '/2b/:id',
                target: (params) => {
                    const id = params.id.includes('thread') ? params.id.split('-')[1] : '';
                    return id ? `/saraba1st/thread/${id}` : '';
                },
            },
        ],
    },
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
        tz: [
            {
                title: '通知',
                docs: 'https://docs.rsshub.app/university.html#chong-qing-li-gong-da-xue',
                source: '/*',
            },
        ],
        lib: [
            {
                title: '图书馆通知',
                docs: 'https://docs.rsshub.app/university.html#chong-qing-li-gong-da-xue',
                source: '/*',
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
            {
                title: '主页',
                docs: 'https://docs.rsshub.app/social-media.html#fur-affinity',
                source: '/',
                target: '/furaffinity/home',
            },
            {
                title: '浏览',
                docs: 'https://docs.rsshub.app/social-media.html#fur-affinity',
                source: '/browse/',
                target: '/furaffinity/browse',
            },
            {
                title: '站点状态',
                docs: 'https://docs.rsshub.app/social-media.html#fur-affinity',
                source: '/',
                target: '/furaffinity/status',
            },
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
            {
                title: '用户主页简介',
                docs: 'https://docs.rsshub.app/social-media.html#fur-affinity',
                source: '/user/:username/',
                target: '/furaffinity/user/:username',
            },
            {
                title: '用户关注列表',
                docs: 'https://docs.rsshub.app/social-media.html#fur-affinity',
                source: '/watchlist/by/:username/',
                target: '/furaffinity/watching/:username',
            },
            {
                title: '用户被关注列表',
                docs: 'https://docs.rsshub.app/social-media.html#fur-affinity',
                source: '/watchlist/to/:username/',
                target: '/furaffinity/watchers/:username',
            },
            {
                title: '用户接受委托信息',
                docs: 'https://docs.rsshub.app/social-media.html#fur-affinity',
                source: '/commissions/:username/',
                target: '/furaffinity/commissions/:username',
            },
            {
                title: '用户的 Shouts 留言',
                docs: 'https://docs.rsshub.app/social-media.html#fur-affinity',
                source: '/user/:username/',
                target: '/furaffinity/shouts/:username',
            },
            {
                title: '用户的日记',
                docs: 'https://docs.rsshub.app/social-media.html#fur-affinity',
                source: '/journals/:username/',
                target: '/furaffinity/journals/:username',
            },
            {
                title: '用户的创作画廊',
                docs: 'https://docs.rsshub.app/social-media.html#fur-affinity',
                source: '/gallery/:username/',
                target: '/furaffinity/gallery/:username',
            },
            {
                title: '用户非正式作品',
                docs: 'https://docs.rsshub.app/social-media.html#fur-affinity',
                source: '/scraps/:username/',
                target: '/furaffinity/scraps/:username',
            },
            {
                title: '用户的喜爱列表',
                docs: 'https://docs.rsshub.app/social-media.html#fur-affinity',
                source: '/favorites/:username/',
                target: '/furaffinity/favorites/:username',
            },
            {
                title: '作品评论区',
                docs: 'https://docs.rsshub.app/social-media.html#fur-affinity',
                source: '/view/:id/',
                target: '/furaffinity/submission_comments/:id',
            },
            {
                title: '日记评论区',
                docs: 'https://docs.rsshub.app/social-media.html#fur-affinity',
                source: '/journal/:id/',
                target: '/furaffinity/journal_comments/:id',
            },
        ],
    },
    'bgm.tv': {
        _name: 'Bangumi',
        '.': [
            {
                title: '小组话题',
                docs: 'https://docs.rsshub.app/anime.html#bangumi',
                source: '/group/:id',
                target: '/bangumi/group/:id',
            },
            {
                title: '小组话题的新回复',
                docs: 'https://docs.rsshub.app/anime.html#bangumi',
                source: '/group/topic/:id',
                target: '/bangumi/topic/:id',
            },
            {
                title: '现实人物的新作品',
                docs: 'https://docs.rsshub.app/anime.html#bangumi',
                source: '/person/:id',
                target: '/bangumi/person/:id',
            },
            {
                title: '用户日志',
                docs: 'https://docs.rsshub.app/anime.html#bangumi',
                source: '/user/:id',
                target: '/bangumi/user/blog/:id',
            },
            {
                title: '条目的讨论',
                docs: 'https://docs.rsshub.app/anime.html#bangumi',
                source: '/subject/:id',
                target: '/bangumi/subject/:id/topics',
            },
            {
                title: '条目的评论',
                docs: 'https://docs.rsshub.app/anime.html#bangumi',
                source: '/subject/:id',
                target: '/bangumi/subject/:id/blogs',
            },
            {
                title: '条目的章节',
                docs: 'https://docs.rsshub.app/anime.html#bangumi',
                source: '/subject/:id',
                target: '/bangumi/subject/:id',
            },
            {
                title: '条目的吐槽箱',
                docs: 'https://docs.rsshub.app/anime.html#bangumi',
                source: '/subject/:id',
                target: '/bangumi/subject/:id/comments',
            },
            {
                title: '放送列表',
                docs: 'https://docs.rsshub.app/anime.html#bangumi',
                source: '/calendar',
                target: '/bangumi/calendar/today',
            },
        ],
    },
    'e-hentai.org/': {
        _name: 'E-Hentai',
        '.': [
            {
                title: '收藏',
                docs: 'https://docs.rsshub.app/picture.html#ehentai',
                source: '/favorites.php',
                target: '/ehentai/favorites',
            },
            {
                title: '标签',
                docs: 'https://docs.rsshub.app/picture.html#ehentai',
                source: '/tag/:tag',
                target: '/ehentai/tag/:tag',
            },
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
            {
                title: '分区',
                docs: 'https://docs.rsshub.app/game.html#lv-fa-shi-ying-di',
                source: '/tz/tag/:tag',
                target: '/lfsyd/tag/:tag',
            },
            {
                title: '用户发帖',
                docs: 'https://docs.rsshub.app/game.html#lv-fa-shi-ying-di',
                source: ['/tz/people/:id', '/tz/people/:id/*'],
                target: '/lfsyd/user/:id',
            },
        ],
        mob: [
            {
                title: '分区',
                docs: 'https://docs.rsshub.app/game.html#lv-fa-shi-ying-di',
                source: '/fine/:tag',
                target: '/lfsyd/tag/:tag',
            },
        ],
    },
    'macwk.com': {
        _name: 'MacWk',
        '.': [
            {
                title: '应用更新',
                docs: 'https://docs.rsshub.app/program-update.html#macwk',
                source: '/soft/:name',
                target: '/macwk/soft/:name',
            },
        ],
    },
};
