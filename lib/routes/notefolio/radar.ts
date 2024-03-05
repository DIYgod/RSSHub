export default {
    'notefolio.net': {
        _name: 'Notefolio',
        '.': [
            {
                title: 'Search',
                docs: 'https://docs.rsshub.app/routes/design#notefolio',
                source: ['/search'],
                target: '/notefolio/search/:category?/:order?/:time?/:query?',
            },
        ],
    },
};
