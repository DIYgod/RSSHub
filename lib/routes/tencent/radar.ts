export default {
    'qq.com': {
        _name: '腾讯',
        'mp.weixin': [
            {
                title: '微信公众号栏目',
                docs: 'https://docs.rsshub.app/routes/new-media#gong-zhong-hao-lan-mu-fei-tui-song-li-shi-xiao-xi',
                source: '/mp/homepage',
                target: (params, url) => `/wechat/mp/homepage/${new URL(url).searchParams.get('__biz')}/${new URL(url).searchParams.get('hid')}/${new URL(url).searchParams.get('cid') ?? ''}`,
            },
            {
                title: '微信公众号话题',
                docs: 'https://docs.rsshub.app/routes/new-media#wei-xin-gong-zhong-hao-wen-zhang-hua-ti-tag',
                source: '/mp/appmsgalbum',
                target: (params, url) => `/wechat/mp/msgalbum/${new URL(url).searchParams.get('__biz')}/${new URL(url).searchParams.get('album_id')}`,
            },
        ],
        new: [
            {
                title: '腾讯企鹅号 - 更新',
                docs: 'https://docs.rsshub.app/routes/new-media#teng-xun-qi-e-hao-geng-xin',
                source: ['/omn/author/:mid'],
                target: '/tencent/news/author/:mid',
            },
            {
                title: '腾讯新闻 - 新型冠状病毒肺炎疫情实时追踪',
                docs: 'https://docs.rsshub.app/routes/other#xin-guan-fei-yan-yi-qing-xin-wen-dong-tai',
                source: ['/zt2020/page/feiyan.htm'],
                target: '/tencent/news/coronavirus/total',
            },
        ],
        pvp: [
            {
                title: '王者荣耀 - 新闻中心',
                docs: 'https://docs.rsshub.app/routes/game#wang-zhe-rong-yao',
                source: ['/web201706/*', '/'],
                target: '/tencent/pvp/newsindex/all',
            },
        ],
        'wiki.connect': [
            {
                title: 'QQ 互联 SDK 更新日志',
                docs: 'https://docs.rsshub.app/routes/program-update#qq-hu-lian-sdk',
                source: '/',
                target: (_params, url) => `/tencent/qq/sdk/changelog/${new URL(url).pathname === '/ios_sdk历史变更' ? 'iOS' : 'Android'}`,
            },
        ],
    },
};
