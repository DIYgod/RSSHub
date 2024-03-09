export default {
    'sogou.com': {
        _name: '搜狗',
        www: [
            {
                title: '搜索',
                docs: 'https://docs.rsshub.app/routes/other#sou-gou-sou-suo',
                source: '/',
                target: (params, url) => {
                    const keyword = new URL(url).searchParams.get('query');
                    return `/sogou/search/${keyword}`;
                },
            },
        ],
    },
};
