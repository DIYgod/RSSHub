export default {
    'getitfree.cn': {
        _name: '正版中国',
        '.': [
            {
                title: '分类',
                docs: 'https://docs.rsshub.app/routes/shopping#zheng-ban-zhong-guo-fen-lei',
                source: ['/category/:id'],
                target: '/getitfree/category/:id',
            },
            {
                title: '标签',
                docs: 'https://docs.rsshub.app/routes/shopping#zheng-ban-zhong-guo-biao-qian',
                source: ['/tag/:id'],
                target: '/getitfree/tag/:id',
            },
            {
                title: '搜索',
                docs: 'https://docs.rsshub.app/routes/shopping#zheng-ban-zhong-guo-sou-suo',
                source: ['/'],
                target: (_, url) => {
                    url = new URL(url);
                    const keyword = url.searchParams.get('s');

                    return `/getitfree/search${keyword ? `/${keyword}` : ''}`;
                },
            },
        ],
    },
};
