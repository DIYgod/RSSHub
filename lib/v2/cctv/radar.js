module.exports = {
    'cctv.com': {
        _name: '央视新闻',
        news: [
            {
                title: '新闻专题',
                docs: 'https://docs.rsshub.app/traditional-media.html#yang-shi-xin-wen',
                source: ['/special/*id'],
                target: (params) => `/cctv/special/${params.id.split('/')[0]}`,
            },
            {
                title: '专题',
                docs: 'https://docs.rsshub.app/traditional-media.html#yang-shi-xin-wen',
                source: ['/:category'],
                target: '/cctv/:category',
            },
        ],
        photo: [
            {
                title: '央视网图片《镜象》',
                docs: 'https://docs.rsshub.app/traditional-media.html#yang-shi-xin-wen',
                source: ['/jx', '/'],
                target: '/cctv/photo/jx',
            },
        ],
        tv: [
            {
                title: '新闻联播',
                docs: 'https://docs.rsshub.app/traditional-media.html#yang-shi-xin-wen',
                source: ['/lm/xwlb', '/'],
                target: '/cctv/xwlb',
            },
            {
                title: '栏目',
                docs: 'https://docs.rsshub.app/traditional-media.html#yang-shi-xin-wen',
                source: ['/lm/*path', '/'],
                target: (params) => `/cctv/lm/${params.path.replace('/videoset', '')}`,
            },
        ],
    },
};
