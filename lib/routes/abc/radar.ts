export default {
    'abc.net.au': {
        _name: 'ABC News',
        '.': [
            {
                title: 'Channel & Topic',
                docs: 'https://docs.rsshub.app/routes/traditional-media#abc-news',
                source: ['/:category*'],
                target: '/abc/:category',
            },
        ],
    },
};
