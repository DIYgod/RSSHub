module.exports = {
    'people.com.cn': {
        _name: '人民网',
        '.': [
            {
                title: '通用',
                docs: 'https://docs.rsshub.app/traditional-media.html#ren-min-wang-tong-yong',
                source: '/',
                target: '/people/:site?/:category?',
            },
        ],
        liuyan: [
            {
                title: '领导留言板',
                docs: 'https://docs.rsshub.app/traditional-media.html#ren-min-wang-ling-dao-liu-yan-ban',
                source: '/',
                target: '/people/liuyan/:id/:state?',
            },
        ],
    },
};
