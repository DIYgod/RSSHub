module.exports = {
    'bing.com': {
        _name: 'Bing',
        cn: [
            {
                title: 'Bing 每日壁纸',
                docs: 'https://docs.rsshub.app/routes/picture#bing-wallpaper',
                source: '/',
                target: '/bing',
            },
            {
                title: 'Bing 搜索',
                docs: 'https://docs.rsshub.app/routes/finance#bigquant-zhuan-ti-bao-gao',
                source: '/',
                target: (params, url) => {
                    const q = new URL(url).searchParams.get('q');
                    return `/bing/search/${q}`;
                },
            },
        ],
    },
};
