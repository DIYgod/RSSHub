export default {
    'nhk.or.jp': {
        _name: 'NHK',
        www3: [
            {
                title: 'News Web Easy',
                docs: 'https://docs.rsshub.app/routes/traditional-media#nhk',
                source: ['/news/easy/', '/'],
                target: '/nhk/news_web_easy',
            },
            {
                title: 'WORLD-JAPAN - 新闻提要',
                docs: 'https://docs.rsshub.app/routes/traditional-media#nhk',
                source: ['/nhkworld/:lang/news/list/', '/nhkworld/:lang/news/'],
                target: '/nhk/news/:lang',
            },
        ],
    },
};
