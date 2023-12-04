module.exports = {
    'so.com': {
        _name: '360 搜索',
        www: [
            {
                title: '搜索',
                docs: 'https://docs.rsshub.app/routes/other#360-sou-suo-sou-suo',
                source: '/',
                target: (params, url) => {
                    const q = new URL(url).searchParams.get('q');
                    return `/so/search/${q}`;
                },
            },
        ],
    },
};
