module.exports = {
    'sakurazaka46.com': {
        _name: '櫻坂46',
        '.': [
            {
                title: '公式ブログ',
                docs: 'https://docs.rsshub.app/new-media.html#',
                source: ['/s/s46/diary/blog/list', '/'],
                target: (params, url) => `/sakurazaka46/blog/${new URL(url).searchParams.get('ct')}`,
            },
        ],
    },
};
