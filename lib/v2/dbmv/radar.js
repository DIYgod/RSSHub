module.exports = {
    'buxiuse.com': {
        _name: '不羞涩',
        '.': [
            {
                title: '分类',
                docs: 'https://docs.rsshub.app/picture.html#bu-xiu-se',
                source: '/',
                target: (_params, url) => `/dbmv${new URL(url).searchParams.has('cid') ? `/${new URL(url).searchParams.get('cid')}` : ''}`,
            },
        ],
    },
};
