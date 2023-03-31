module.exports = {
    'line.me': {
        _name: 'LINE',
        '.': [
            {
                title: 'Today',
                docs: 'https://docs.rsshub.app/new-media.html#line-today',
                source: ['/'],
                target: '/line/today/:edition?/:tab?',
            },
            {
                title: 'Today - 频道',
                docs: 'https://docs.rsshub.app/new-media.html#line-today',
                source: ['/:edition/v2/publisher/:id'],
                target: '/line/today/:edition/publisher/:id',
            },
        ],
    },
};
