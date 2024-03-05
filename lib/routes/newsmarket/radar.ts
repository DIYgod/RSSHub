export default {
    'newsmarket.com.tw': {
        _name: '上下游News&amp;Market',
        '.': [
            {
                title: '分類',
                docs: 'https://docs.rsshub.app/routes/new-media#shang-xia-you-news-market',
                source: ['/blog/category/:category', '/'],
                target: '/newsmarket/:category?',
            },
        ],
    },
};
