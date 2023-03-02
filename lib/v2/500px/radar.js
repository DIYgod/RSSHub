module.exports = {
    '500px.com.cn': {
        _name: '500px 摄影社区',
        '.': [
            {
                title: '部落影集',
                docs: 'https://docs.rsshub.app/picture.html#_500px-she-ying-she-qu',
                source: ['/page/tribe/detail'],
                target: (_, url) => `/500px/tribe/set/${url.searchParams.get('tribeId')}`,
            },
            {
                title: '摄影师作品',
                docs: 'https://docs.rsshub.app/picture.html#_500px-she-ying-she-qu',
                source: ['/:id', '/community/user-details/:id', '/community/user-details/:id/*'],
                target: '/500px/user/works/:id',
            },
        ],
    },
};
