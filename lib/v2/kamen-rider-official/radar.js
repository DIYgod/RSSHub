module.exports = {
    'kamen-rider-official.com': {
        _name: '仮面ライダ',
        '.': [
            {
                title: '最新情報',
                docs: 'https://docs.rsshub.app/routes/new-media#fan-mian-%E3%83%A9%E3%82%A4%E3%83%80-zui-xin-qing-bao',
                source: ['/news_articles'],
                target: (params, url) => {
                    url = new URL(url);
                    const category = url.searchParams.get('category');

                    return `/kamen-rider-official/news${category ? `/${category}` : ''}`;
                },
            },
        ],
    },
};
