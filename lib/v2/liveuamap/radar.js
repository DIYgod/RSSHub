module.exports = {
    'liveuamap.com': {
        _name: 'Live Universal Awareness Map',
        '.': [
            {
                title: 'Region',
                docs: 'https://docs.rsshub.app/routes/new-media#liveuamap',
                source: ['/:region*'],
                target: '/liveuamap/:region',
            },
        ],
    },
};
