export default {
    'dcfever.com': {
        _name: 'DCFever',
        '.': [
            {
                title: '新聞中心',
                docs: 'https://docs.rsshub.app/routes/new-media#dcfever',
                source: ['/news/index.php', '/'],
                target: (_, url) => {
                    const searchParams = new URL(url).searchParams;
                    return `/dcfever/news${searchParams.has('type') ? `/${new URL(url).searchParams.get('type')}` : ''}`;
                },
            },
            {
                title: '測試報告',
                docs: 'https://docs.rsshub.app/routes/new-media#dcfever',
                source: ['/:type/reviews.php'],
                target: '/dcfever/reviews/:type',
            },
            {
                title: '二手市集',
                docs: 'https://docs.rsshub.app/routes/new-media#dcfever',
                source: ['/trading/listing.php'],
                target: (_, url) => `/dcfever/trading/${new URL(url).searchParams.get('id')}`,
            },
            {
                title: '二手市集 - 物品搜尋',
                docs: 'https://docs.rsshub.app/routes/new-media#dcfever',
                source: ['/trading/search.php'],
                target: (_, url) => {
                    const searchParams = new URL(url).searchParams;
                    return `/dcfever/trading/search/${searchParams.get('keyword')}${searchParams.has('main_cat') ? `/${searchParams.get('main_cat')}` : ''}`;
                },
            },
        ],
    },
};
