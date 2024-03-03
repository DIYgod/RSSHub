export default {
    'nature.com': {
        _name: 'Nature',
        '.': [
            {
                title: '最新成果',
                docs: 'https://docs.rsshub.app/routes/journal#nature-xi-lie',
                source: ['/:journal/research-articles', '/:journal', '/'],
                target: '/nature/research/:journal',
            },
            {
                title: '新闻及评论',
                docs: 'https://docs.rsshub.app/routes/journal#nature-xi-lie',
                source: ['/:journal/news-and-comment', '/:journal', '/'],
                target: '/nature/news-and-comment/:journal',
            },
            {
                title: '封面故事',
                docs: 'https://docs.rsshub.app/routes/journal#nature-xi-lie',
                source: ['/'],
                target: '/nature/cover',
            },
            {
                title: '主刊 - 新闻动态',
                docs: 'https://docs.rsshub.app/routes/journal#nature-xi-lie',
                source: ['/latest-news', '/news', '/'],
                target: '/nature/news',
            },
            {
                title: '精彩研究',
                docs: 'https://docs.rsshub.app/routes/journal#nature-xi-lie',
                source: ['/:journal/articles', '/:journal', '/'],
                target: '/nature/highlight/:journal',
            },
        ],
    },
};
