module.exports = {
    'nikkei.com': {
        _name: '日本经济新闻',
        www: [
            {
                title: 'ホームページ',
                docs: 'https://docs.rsshub.app/traditional-media.html#ri-ben-jing-ji-xin-wen',
                source: '/',
                target: '/nikkei/index',
            },
            {
                title: '新聞',
                docs: 'https://docs.rsshub.app/traditional-media.html#ri-ben-jing-ji-xin-wen',
                source: ['/:category/archive', '/:category'],
                target: '/nikkei/:category',
            },
        ],
    },
};
