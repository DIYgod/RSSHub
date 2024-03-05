export default {
    'tvtropes.org': {
        _name: 'TV Tropes',
        '.': [
            {
                title: "Featured - Today's Featured Trope",
                docs: 'https://docs.rsshub.app/routes/other#tvtropes-featured',
                source: ['/'],
                target: '/tvtropes/featured/today',
            },
            {
                title: 'Featured - Newest Trope',
                docs: 'https://docs.rsshub.app/routes/other#tvtropes-featured',
                source: ['/'],
                target: '/tvtropes/featured/newest',
            },
        ],
    },
};
