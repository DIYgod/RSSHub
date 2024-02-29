({
    'aamacau.com': { _name: '論盡媒體 AllAboutMacau Media', '.': [{ title: '话题', docs: 'https://docs.rsshub.app/routes/new-media#lun-jin-mei-ti-allaboutmacau-media-hua-ti', source: ['/'], target: '/:category?/:id?' }] },
    'eprice.com.tw': { _name: 'ePrice', '.': [{ title: 'ePrice 比價王', docs: 'https://docs.rsshub.app/routes/new-media#eprice', source: ['/'], target: '/:region?' }] },
    'eprice.com.hk': { _name: 'ePrice', '.': [{ title: 'ePrice 香港', docs: 'https://docs.rsshub.app/routes/new-media#eprice', source: ['/'], target: '/:region?' }] },
    'furstar.jp': {
        _name: 'Furstar',
        '.': [
            { title: '最新售卖角色列表', docs: 'https://docs.rsshub.app/routes/shopping#furstar-zui-xin-shou-mai-jiao-se-lie-biao', source: ['/:lang', '/'], target: '/furstar/characters/:lang' },
            { title: '已经出售的角色列表', docs: 'https://docs.rsshub.app/routes/shopping#furstar-yi-jing-chu-shou-de-jiao-se-lie-biao', source: ['/:lang/archive.php', '/archive.php'], target: '/furstar/archive/:lang' },
            { title: '画师列表', docs: 'https://docs.rsshub.app/routes/shopping#furstar-hua-shi-lie-biao', source: ['/'], target: '/furstar/artists' },
        ],
    },
    'trow.cc': { _name: 'The Ring of Wonder', '.': [{ title: '首页更新', docs: 'https://docs.rsshub.app/routes/bbs#the-ring-of-wonder', source: ['/'], target: '/portal' }] },
    'github.com': {
        _name: 'GitHub',
        '.': [
            { title: '用户仓库', docs: 'https://docs.rsshub.app/routes/programming#github', source: '/:user', target: '/github/repos/:user' },
            { title: '用户 Followers', docs: 'https://docs.rsshub.app/routes/programming#github', source: '/:user', target: '/github/user/followers/:user' },
            { title: 'Trending', docs: 'https://docs.rsshub.app/routes/programming#github', source: '/trending', target: '/github/trending/:since' },
            { title: 'Trending', docs: 'https://docs.rsshub.app/routes/programming#github', source: '/topics', target: '/github/topics/:name/:qs?' },
            { title: '仓库 Issue', docs: 'https://docs.rsshub.app/routes/programming#github', source: ['/:user/:repo/issues', '/:user/:repo/issues/:id', '/:user/:repo'], target: '/github/issue/:user/:repo' },
            { title: '仓库 Pull Requests', docs: 'https://docs.rsshub.app/routes/programming#github', source: ['/:user/:repo/pulls', '/:user/:repo/pulls/:id', '/:user/:repo'], target: '/github/pull/:user/:repo' },
            { title: '仓库 Stars', docs: 'https://docs.rsshub.app/routes/programming#github', source: ['/:user/:repo/stargazers', '/:user/:repo'], target: '/github/stars/:user/:repo' },
            { title: '仓库 Branches', docs: 'https://docs.rsshub.app/routes/programming#github', source: ['/:user/:repo/branches', '/:user/:repo'], target: '/github/branches/:user/:repo' },
            { title: '文件 Commits', docs: 'https://docs.rsshub.app/routes/programming#github', source: '/:user/:repo/blob/:branch/*filepath', target: '/github/file/:user/:repo/:branch/:filepath' },
            { title: '用户 Starred Repositories', docs: 'https://docs.rsshub.app/routes/programming#github', source: '/:user', target: '/github/starred_repos/:user' },
            { title: '仓库 Contributors', docs: 'https://docs.rsshub.app/routes/programming#github', source: ['/:user/:repo/graphs/contributors', '/:user/:repo'], target: '/github/contributors/:user/:repo' },
        ],
    },
    'algocasts.io': { _name: 'AlgoCasts', '.': [{ title: '视频更新', docs: 'https://docs.rsshub.app/routes/programming#algocasts', source: '/episodes', target: '/algocasts' }] },
    'soulapp.cn': { _name: 'Soul', '.': [{ title: '瞬间更新', docs: 'https://docs.rsshub.app/routes/social-media#soul' }] },
    'anime1.me': {
        _name: 'Anime1',
        '.': [
            { title: '動畫', docs: 'https://docs.rsshub.app/routes/anime#anime1', source: '/category/:time/:name', target: '/anime1/anime/:time/:name' },
            {
                title: '搜尋',
                docs: 'https://docs.rsshub.app/routes/anime#anime1',
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
            { title: '经济信息工程学院 - 通知公告', docs: 'https://docs.rsshub.app/routes/university#xi-nan-cai-jing-da-xue', source: '/index/tzgg.htm', target: '/swufe/seie/tzgg' },
            { title: '经济信息工程学院 - 学院新闻', docs: 'https://docs.rsshub.app/routes/university#xi-nan-cai-jing-da-xue', source: '/index/xyxw.htm', target: '/swufe/seie/xyxw' },
        ],
    },
    'www.chicagotribune.com': { _name: 'Chicago Tribune', www: [{ title: 'Chicago Tribune', docs: 'https://docs.rsshub.app/routes/traditional_media#chicago-tribune', source: '/' }] },
    'monsterhunter.com': {
        _name: '怪物猎人世界',
        www: [
            { title: '更新情报', docs: 'https://docs.rsshub.app/routes/game#guai-wu-lie-ren-shi-jie', source: ['', '/*tpath'], target: '/mhw/update' },
            { title: '最新消息', docs: 'https://docs.rsshub.app/routes/game#guai-wu-lie-ren-shi-jie', source: ['', '/*tpath'], target: '/mhw/news' },
        ],
    },
    'bing.com': { _name: 'Bing', www: [{ title: '每日壁纸', docs: 'https://docs.rsshub.app/routes/picture#bing-bi-zhi', source: '', target: '/bing' }] },
    'wegene.com': {
        _name: 'WeGene',
        www: [
            { title: '最近更新', docs: 'https://docs.rsshub.app/routes/other#wegene', source: '', target: '/wegene/newest' },
            { title: '栏目', docs: 'https://docs.rsshub.app/routes/other#wegene', source: '/crowdsourcing', target: '/wegene/column/all/all' },
        ],
    },
    'emi-nitta.net': {
        _name: 'Emi Nitta',
        '.': [
            { title: '最近更新', docs: 'https://docs.rsshub.app/routes/other#xin-tian-hui-hai-guan-fang-wang-zhan', source: '/updates', target: '/emi-nitta/updates' },
            { title: '新闻', docs: 'https://docs.rsshub.app/routes/other#xin-tian-hui-hai-guan-fang-wang-zhan', source: '/contents/news', target: '/emi-nitta/news' },
        ],
    },
    'yuancheng.work': {
        _name: '远程.work',
        '.': [
            {
                title: '招聘信息',
                docs: 'https://docs.rsshub.app/routes/other#yuan-cheng-work',
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
    'govopendata.com': { _name: '新闻联播文字版', cn: [{ title: '新闻联播文字版', docs: 'https://docs.rsshub.app/routes/traditional-media#xin-wen-lian-bo-wen-zi-ban', source: '/xinwenlianbo', target: '/xinwenlianbo/index' }] },
    'steampowered.com': { _name: 'Steam', store: [{ title: 'search', docs: 'https://docs.rsshub.app/routes/game#steam', source: '/search/', target: (params, url) => `/steam/search/${new URL(url).searchParams}` }] },
    'suzhou.gov.cn': { _name: '苏州市政府', www: [{ title: '政府新闻', docs: 'https://docs.rsshub.app/routes/government#su-zhou-shi-ren-min-zheng-fu', source: '/szsrmzf/:uid/nav_list.', target: '/gov/suzhou/news/:uid' }] },
    'last.fm': {
        _name: 'Last.fm',
        www: [
            { title: '用户播放记录', docs: 'https://docs.rsshub.app/routes/multimedia#last-fm', source: ['/user/:user', '/user/:user/*'], target: '/lastfm/recent/:user' },
            { title: '用户 Love 记录', docs: 'https://docs.rsshub.app/routes/multimedia#last-fm', source: ['/user/:user', '/user/:user/*'], target: '/lastfm/loved/:user' },
            { title: '站内 Top 榜单', docs: 'https://docs.rsshub.app/routes/multimedia#last-fm', source: '/charts', target: '/lastfm/top' },
        ],
    },
    'hackerone.com': { _name: 'HackerOne', '.': [{ title: 'HackerOne Hacker Activity', docs: 'https://docs.rsshub.app/routes/other#hackerone-hacker-activity', source: '/hacktivity', target: '/hackerone/hacktivity' }] },
    'cowlevel.net': { _name: '奶牛关', '.': [{ title: '元素文章', docs: 'https://docs.rsshub.app/routes/game#nai-niu-guan', source: ['/element/:id', '/element/:id/article'], target: '/cowlevel/element/:id' }] },
    'beijing.gov.cn': { wjw: [{ title: '北京卫生健康委员会', docs: 'https://docs.rsshub.app/routes/government#bei-jing-shi-wei-sheng-jian-kang-wei-yuan-hui', source: '/xwzx_20031/:caty', target: '/gov/beijing/mhc/:caty' }] },
    'ynu.edu.cn': {
        _name: '云南大学',
        home: [{ title: '官网消息通告', docs: 'https://docs.rsshub.app/routes/university#yun-nan-da-xue', source: '/tzgg.htm', target: '/ynu/home' }],
        jwc: [
            { title: '教务处教务科通知', docs: 'https://docs.rsshub.app/routes/university#yun-nan-da-xue', source: '/*', target: '/jwc/1' },
            { title: '教务处学籍科通知', docs: 'https://docs.rsshub.app/routes/university#yun-nan-da-xue', source: '/*', target: '/jwc/2' },
            { title: '教务处教学研究科通知', docs: 'https://docs.rsshub.app/routes/university#yun-nan-da-xue', source: '/*', target: '/jwc/3' },
            { title: '教务处实践科学科通知', docs: 'https://docs.rsshub.app/routes/university#yun-nan-da-xue', source: '/*', target: '/jwc/4' },
        ],
        grs: [{ title: '研究生院通知', docs: 'https://docs.rsshub.app/routes/university#yun-nan-da-xue', source: '/*', target: '' }],
    },
    // 'biquge5200.com': { www: [{ title: 'biquge5200.com', docs: 'https://docs.rsshub.app/routes/reading#bi-qu-ge-biquge5200-com', source: '/:id', target: '/novel/biquge/:id' }] },
    // 'biquge.info': { www: [{ title: 'biquge.info', docs: 'https://docs.rsshub.app/routes/reading#bi-qu-ge-biquge-info', source: '/:id', target: '/novel/biqugeinfo/:id' }] },
    'matters.news': {
        _name: 'Matters',
        '.': [
            { title: '最新排序', docs: 'https://docs.rsshub.app/routes/new-media#matters', source: '', target: '/matters/latest' },
            { title: '标签', docs: 'https://docs.rsshub.app/routes/new-media#matters', source: '/tags/:tid', target: '/matters/tags/:tid' },
            {
                title: '作者',
                docs: 'https://docs.rsshub.app/routes/new-media#matters',
                source: ['/:id', '/:id/comments'],
                target: (params) => {
                    const uid = params.id.replace('@', '');
                    return uid ? `/matters/author/${uid}` : '';
                },
            },
        ],
    },
    'hbut.edu.cn': {
        _name: '湖北工业大学',
        www: [
            {
                title: '新闻中心',
                docs: 'http://docs.rsshub.app/routes/university#hu-bei-gong-ye-da-xue',
                source: '/xwzx/:name',
                target: (params) => {
                    const type = params.name.replace('.htm', '');
                    return type ? `/hbut/news/${type}` : '/hbut/news/tzgg';
                },
            },
        ],
        jsjxy: [
            { title: '新闻动态', docs: 'http://docs.rsshub.app/routes/university#hu-bei-gong-ye-da-xue', source: '/index/xwdt.htm', target: '/hbut/cs/xwdt' },
            { title: '通知公告', docs: 'http://docs.rsshub.app/routes/university#hu-bei-gong-ye-da-xue', source: '/index/tzgg.htm', target: '/hbut/cs/tzgg' },
            { title: '教学信息', docs: 'http://docs.rsshub.app/routes/university#hu-bei-gong-ye-da-xue', source: '/jxxx.htm', target: '/hbut/cs/jxxx' },
            { title: '科研动态', docs: 'http://docs.rsshub.app/routes/university#hu-bei-gong-ye-da-xue', source: '/kxyj/kydt.htm', target: '/hbut/cs/kydt' },
            { title: '党建活动', docs: 'http://docs.rsshub.app/routes/university#hu-bei-gong-ye-da-xue', source: '/djhd/djhd.htm', target: '/hbut/cs/djhd' },
        ],
    },
    'zhuixinfan.com': { _name: '追新番日剧站', '.': [{ title: '更新列表', docs: 'https://docs.rsshub.app/routes/multimedia#zhui-xin-fan-ri-ju-zhan', source: ['/main.php'], target: '/zhuixinfan/list' }] },
    'etoland.co.kr': {
        _name: 'eTOLAND',
        '.': [{ title: '主题贴', docs: 'https://docs.rsshub.app/routes/bbs#etoland', source: ['/bbs/board.php', '/plugin/mobile/board.php'], target: (params, url) => `/etoland/${new URL(url).searchParams.get('bo_table')}` }],
    },
    'onejav.com': {
        _name: 'OneJAV BT',
        '.': [
            {
                title: '今日种子',
                docs: 'https://docs.rsshub.app/routes/multimedia#onejav',
                source: '/',
                target: (params, url, document) => {
                    const today = document.querySelector('div.card.mb-1.card-overview').dataset.date.replaceAll('-', '');
                    return `/onejav/day/${today}`;
                },
            },
            {
                title: '今日演员',
                docs: 'https://docs.rsshub.app/routes/multimedia#onejav',
                source: '/',
                target: (params, url, document) => {
                    const star = document.querySelector('div.card-content > div > a').getAttribute('href');
                    return `/onejav${star}`;
                },
            },
            {
                title: '页面种子',
                docs: 'https://docs.rsshub.app/routes/multimedia#onejav',
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
    'sexinsex.net': {
        _name: 'sexinsex',
        '.': [
            {
                title: '分区帖子',
                docs: 'https://docs.rsshub.app/routes/multimedia#sexinsex',
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
                    return `/sexinsex/${pid}/${typeid ?? ''}`;
                },
            },
        ],
    },
    't66y.com': {
        _name: '草榴社区',
        www: [
            {
                title: '分区帖子',
                docs: 'https://docs.rsshub.app/routes/multimedia#cao-liu-she-qu',
                source: '/thread0806.php',
                target: (params, url) => {
                    const id = new URL(url).searchParams.get('fid');
                    const type = new URL(url).searchParams.get('type');
                    return `/t66y/${id}/${type ?? ''}`;
                },
            },
        ],
    },
    'umass.edu': {
        _name: 'UMASS Amherst',
        ece: [
            { title: 'ECE News', docs: 'http://docs.rsshub.app/routes/university#umass-amherst', source: '/news', target: '/umass/amherst/ecenews' },
            { title: 'ECE Seminar', docs: 'http://docs.rsshub.app/routes/university#umass-amherst', source: '/seminars', target: '/umass/amherst/eceseminar' },
        ],
        'www.cics': [{ title: 'CICS News', docs: 'http://docs.rsshub.app/routes/university#umass-amherst', source: '/news', target: '/umass/amherst/csnews' }],
        www: [
            { title: 'IPO Events', docs: 'http://docs.rsshub.app/routes/university#umass-amherst', source: '/ipo/iss/events', target: '/umass/amherst/ipoevents' },
            { title: 'IPO Featured Stories', docs: 'http://docs.rsshub.app/routes/university#umass-amherst', source: '/ipo/iss/featured-stories', target: '/umass/amherst/ipostories' },
        ],
    },
    'bjeea.com': {
        _name: '北京考试院',
        www: [
            { title: '首页 / 通知公告', docs: 'https://docs.rsshub.app/routes/government#bei-jing-jiao-yu-kao-shi-yuan', source: ['/bjeeagg'], target: '/gov/beijing/bjeea/bjeeagg' },
            { title: '首页 / 招考政策', docs: 'https://docs.rsshub.app/routes/government#bei-jing-jiao-yu-kao-shi-yuan', source: ['/zkzc'], target: '/gov/beijing/bjeea/zkzc' },
            { title: '首页 / 自考快递', docs: 'https://docs.rsshub.app/routes/government#bei-jing-jiao-yu-kao-shi-yuan', source: ['/zkkd'], target: '/gov/beijing/bjeea/zkkd' },
        ],
    },
    'nppa.gov.cn': {
        _name: '国家新闻出版署',
        www: [
            { title: '栏目', docs: 'https://docs.rsshub.app/routes/government#guo-jia-xin-wen-chu-ban-shu', source: '/nppa/channels/:channel', target: (params, url) => `/gov/nppa/${/nppa\/channels\/(\d+)\./.exec(url)[1]}` },
            {
                title: '内容',
                docs: 'https://docs.rsshub.app/routes/government#guo-jia-xin-wen-chu-ban-shu',
                source: '/nppa/contents/:channel/:content',
                target: (params, url) => `/gov/nppa/${/nppa\/contents\/(\d+\/\d+)\.shtml/.exec(url)[1]}`,
            },
        ],
    },
    'jjmhw.cc': { _name: '漫小肆', www: [{ title: '漫画更新', docs: 'https://docs.rsshub.app/routes/anime#man-xiao-si', source: '/book/:id', target: '/manxiaosi/book/:id' }] },
    'wenxuecity.com': {
        _name: '文学城',
        blog: [
            { title: '博客', docs: 'https://docs.rsshub.app/routes/bbs#wen-xue-cheng-bo-ke', source: '/myblog/:id', target: '/wenxuecity/blog/:id' },
            { title: '博客', docs: 'https://docs.rsshub.app/routes/bbs#wen-xue-cheng-bo-ke', source: '/myoverview/:id', target: '/wenxuecity/blog/:id' },
        ],
        bbs: [
            { title: '最新主题', docs: 'https://docs.rsshub.app/routes/bbs#wen-xue-cheng-zui-xin-zhu-ti', source: '/:cat', target: '/wenxuecity/bbs/:cat' },
            { title: '最新主题 - 精华区', docs: 'https://docs.rsshub.app/routes/bbs#wen-xue-cheng-zui-xin-zhu-ti', source: '/:cat', target: '/wenxuecity/bbs/:cat/1' },
            {
                title: '最热主题',
                docs: 'https://docs.rsshub.app/routes/bbs#wen-xue-cheng-zui-re-zhu-ti',
                source: '/?cid=*',
                target: (params, url, document) => {
                    const cid = document && new URL(document.location).searchParams.get('cid');
                    return `/wenxuecity/hot/${cid}`;
                },
            },
        ],
    },
    'eventernote.com': { _name: 'Eventernote', www: [{ title: '声优活动及演唱会', docs: 'https://docs.rsshub.app/routes/anime#eventernote', source: '/actors/:name/:id/events', target: '/eventernote/actors/:name/:id' }] },
    'huya.com': { _name: '虎牙直播', '.': [{ title: '直播间开播', docs: 'https://docs.rsshub.app/routes/live#hu-ya-zhi-bo-zhi-bo-jian-kai-bo', source: '/:id', target: '/huya/live/:id' }] },
    'scboy.com': {
        _name: 'scboy 论坛',
        www: [
            {
                title: '帖子',
                docs: 'https://docs.rsshub.app/routes/bbs#scboy',
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
        tz: [{ title: '通知', docs: 'https://docs.rsshub.app/routes/university#chong-qing-li-gong-da-xue', source: '/*' }],
        lib: [{ title: '图书馆通知', docs: 'https://docs.rsshub.app/routes/university#chong-qing-li-gong-da-xue', source: '/*' }],
    },
    'cqwu.net': {
        _name: '重庆文理学院',
        www: [
            {
                title: '通知',
                docs: 'https://docs.rsshub.app/routes/university#chong-qing-wen-li-xue-yuan',
                source: '/:type',
                target: (params) => {
                    if (params.type === 'channel_7721.html') {
                        return '/cqwu/news/notify';
                    }
                },
            },
            {
                title: '学术活动',
                docs: 'https://docs.rsshub.app/routes/university#chong-qing-wen-li-xue-yuan',
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
                docs: 'https://docs.rsshub.app/routes/multimedia#trakt-tv-yong-hu-shou-cang',
                source: ['/users/:username/collection/:type/added', '/users/:username/collection'],
                target: (params) => `/trakt/collection/${params.username}/${params.type || 'all'}`,
            },
        ],
    },
    'furaffinity.net': {
        _name: 'Fur Affinity',
        www: [
            { title: '主页', docs: 'https://docs.rsshub.app/routes/social-media#fur-affinity', source: '/', target: '/furaffinity/home' },
            { title: '浏览', docs: 'https://docs.rsshub.app/routes/social-media#fur-affinity', source: '/browse/', target: '/furaffinity/browse' },
            { title: '站点状态', docs: 'https://docs.rsshub.app/routes/social-media#fur-affinity', source: '/', target: '/furaffinity/status' },
            {
                title: '搜索',
                docs: 'https://docs.rsshub.app/routes/social-media#fur-affinity',
                source: '/search/',
                target: (params, url) => {
                    const keyword = new URL(url).searchParams.get('q');
                    if (keyword) {
                        return `/furaffinity/search/${keyword}`;
                    }
                },
            },
            { title: '用户主页简介', docs: 'https://docs.rsshub.app/routes/social-media#fur-affinity', source: '/user/:username/', target: '/furaffinity/user/:username' },
            { title: '用户关注列表', docs: 'https://docs.rsshub.app/routes/social-media#fur-affinity', source: '/watchlist/by/:username/', target: '/furaffinity/watching/:username' },
            { title: '用户被关注列表', docs: 'https://docs.rsshub.app/routes/social-media#fur-affinity', source: '/watchlist/to/:username/', target: '/furaffinity/watchers/:username' },
            { title: '用户接受委托信息', docs: 'https://docs.rsshub.app/routes/social-media#fur-affinity', source: '/commissions/:username/', target: '/furaffinity/commissions/:username' },
            { title: '用户的 Shouts 留言', docs: 'https://docs.rsshub.app/routes/social-media#fur-affinity', source: '/user/:username/', target: '/furaffinity/shouts/:username' },
            { title: '用户的日记', docs: 'https://docs.rsshub.app/routes/social-media#fur-affinity', source: '/journals/:username/', target: '/furaffinity/journals/:username' },
            { title: '用户的创作画廊', docs: 'https://docs.rsshub.app/routes/social-media#fur-affinity', source: '/gallery/:username/', target: '/furaffinity/gallery/:username' },
            { title: '用户非正式作品', docs: 'https://docs.rsshub.app/routes/social-media#fur-affinity', source: '/scraps/:username/', target: '/furaffinity/scraps/:username' },
            { title: '用户的喜爱列表', docs: 'https://docs.rsshub.app/routes/social-media#fur-affinity', source: '/favorites/:username/', target: '/furaffinity/favorites/:username' },
            { title: '作品评论区', docs: 'https://docs.rsshub.app/routes/social-media#fur-affinity', source: '/view/:id/', target: '/furaffinity/submission_comments/:id' },
            { title: '日记评论区', docs: 'https://docs.rsshub.app/routes/social-media#fur-affinity', source: '/journal/:id/', target: '/furaffinity/journal_comments/:id' },
        ],
    },
    'foreverblog.cn': {
        _name: 'foreverblog',
        www: [
            {
                title: '十年之约',
                docs: 'https://docs.rsshub.app/routes/social-media#foreverblog',
            },
        ],
    },
});
