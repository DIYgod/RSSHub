export default {
    'qianzhan.com': {
        _name: '前瞻网',
        '.': [
            {
                title: '文章列表',
                docs: 'https://docs.rsshub.app/routes/finance#qian-zhan-wang',
                source: ['/analyst', '/analyst/list/:html'],
                target: (params) => {
                    if (params.html) {
                        const type = params.html.match(/\d+/)[0];
                        return '/qianzhan/analyst/column/' + type;
                    } else {
                        return '/qianzhan/analyst/column/all';
                    }
                },
            },
            {
                title: '排行榜',
                docs: 'https://docs.rsshub.app/routes/finance#qian-zhan-wang',
                source: ['/analyst', '/'],
                target: '/qianzhan/analyst/rank',
            },
        ],
    },
};
