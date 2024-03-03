export default {
    'line.me': {
        _name: 'LINE',
        today: [
            {
                title: 'Today',
                docs: 'https://docs.rsshub.app/routes/new-media#line-today',
                source: ['/'],
                target: '/line/today/:edition?/:tab?',
            },
            {
                title: 'Today - 频道',
                docs: 'https://docs.rsshub.app/routes/new-media#line-today',
                source: ['/:edition/v2/publisher/:id'],
                target: '/line/today/:edition/publisher/:id',
            },
        ],
    },
};
