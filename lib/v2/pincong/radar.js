module.exports = {
    'pincong.rocks': {
        _name: '品葱',
        '.': [
            {
                title: '发现',
                docs: 'https://docs.rsshub.app/bbs.html#pin-cong',
                source: '/',
                target: (_params, url) => {
                    const sortMap = {
                        'sort_type-new': 'new',
                        'recommend-1': 'recommend',
                        'sort_type-hot__day2': 'hot',
                    };
                    const path = new URL(url).pathname;
                    const category = (/__category/.test(path) ? path.split('__')[1] : path).replace('category-', '');
                    const sort = sortMap[/__category/.test(path) ? path.split('__')[0] : 'recommend-1'];
                    return `/pincong/category/${category}/${sort}`;
                },
            },
            {
                title: '精选',
                docs: 'https://docs.rsshub.app/bbs.html#pin-cong',
                source: ['/hot/:category'],
                target: (params) => `/pincong/hot${params.category ? `/${params.category.replace('category-', '')}` : ''}`,
            },
            {
                title: '话题',
                docs: 'https://docs.rsshub.app/bbs.html#pin-cong',
                source: '/topic/:topic',
                target: '/pincong/topic/:topic',
            },
        ],
    },
};
