module.exports = {
    'myzaker.com': {
        _name: 'ZAKER',
        '.': [
            {
                title: '分类',
                docs: 'https://docs.rsshub.app/new-media.html#zaker',
                source: ['/:type/:id'],
                target: '/zaker/:type/:id',
            },
            {
                title: '精读',
                docs: 'https://docs.rsshub.app/new-media.html#zaker',
                source: ['/'],
                target: '/zaker/focusread',
            },
        ],
    },
};
