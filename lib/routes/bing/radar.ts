export default {
    'bing.com': {
        _name: 'Bing',
        cn: [
            {
                title: '每日壁纸',
                docs: 'https://docs.rsshub.app/routes/picture#bing',
                source: '/',
                target: '/bing',
            },
            {
                title: '搜索',
                docs: 'https://docs.rsshub.app/routes/other#bing',
                source: '/',
                target: (params, url) => {
                    const q = new URL(url).searchParams.get('q');
                    return `/bing/search/${q}`;
                },
            },
        ],
    },
};
