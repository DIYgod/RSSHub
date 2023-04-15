module.exports = {
    'careerengine.us': {
        _name: '微信',
        posts: [
            {
                title: '公众号（CareerEngine 来源）',
                docs: 'https://docs.rsshub.app/new-media.html#wei-xin',
                source: ['/author/*id/posts'],
                target: (params) => `/wechat/ce/${params.id}`,
            },
        ],
    },
    'cimidata.com': {
        _name: '微信',
        '.': [
            {
                title: '公众号（二十次幂来源）',
                docs: 'https://docs.rsshub.app/new-media.html#wei-xin',
                source: ['/a/:id'],
                target: '/wechat/ce/:id',
            },
        ],
    },
    'data258.com': {
        _name: '微信',
        mp: [
            {
                title: '公众号（微阅读来源）',
                docs: 'https://docs.rsshub.app/new-media.html#wei-xin',
                source: ['/', '/article/category/:id'],
                target: '/wechat/data258/:id?',
            },
        ],
    },
    'feeddd.org': {
        _name: '微信',
        '.': [
            {
                title: '公众号（feeddd 来源）',
                docs: 'https://docs.rsshub.app/new-media.html#wei-xin',
                source: ['/'],
            },
        ],
    },
    'mp.weixin.qq.com': {
        _name: '微信',
        '.': [
            {
                title: '公众平台系统公告栏目',
                docs: 'https://docs.rsshub.app/new-media.html#wei-xin',
                source: ['/cgi-bin/announce'],
                target: '/wechat/announce',
            },
        ],
    },
    'privacyhide.com': {
        _name: '微信',
        wechat: [
            {
                title: '公众号（wechat-feeds 来源）',
                docs: 'https://docs.rsshub.app/new-media.html#wei-xin',
            },
        ],
    },
    'sogou.com': {
        _name: '微信',
        weixin: [
            {
                title: '公众号（搜狗来源）',
                docs: 'https://docs.rsshub.app/new-media.html#wei-xin',
                source: ['/weixin'],
                target: (_, url) => {
                    const id = new URL(url).searchParams.get('query');
                    if (id === null) {
                        return false;
                    }
                    return `/wechat/sogou/${id}`;
                },
            },
        ],
    },
    'wxnmh.com': {
        _name: '微信',
        '.': [
            {
                title: '公众号（wxnmh.com 来源）',
                docs: 'https://docs.rsshub.app/new-media.html#wei-xin',
                source: ['/:id'],
                target: (params) => `/wechat/wxnmh/${params.id.replace('user-', '').replace('.htm', '')}`,
            },
        ],
    },
    'xlab.app': {
        _name: '微信',
        wechat2rss: [
            {
                title: '公众号（wechat2rss 来源）',
                docs: 'https://docs.rsshub.app/new-media.html#wei-xin',
                source: ['/feed/:id'],
                target: (params) => `/wechat/wechat2rss/${params.id.replace('.xml', '')}`,
            },
        ],
    },
};
