module.exports = {
    'mobilism.org': {
        _name: 'Mobilism',
        '.': [
            {
                title: '论坛',
                docs: 'https://docs.rsshub.app/bbs.html#mobilism',
                source: '/',
            },
            {
                title: '门户',
                docs: 'https://docs.rsshub.app/bbs.html#mobilism',
                source: '/portal.php',
                target: (_params, url) => `/mobilism/portal/${new URL(url).searchParams.get('block')}`,
            },
            {
                title: '电子书',
                docs: 'https://docs.rsshub.app/reading.html#mobilism',
                source: '/',
            },
        ],
    },
};
