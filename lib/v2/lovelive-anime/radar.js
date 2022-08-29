module.exports = {
    'lovelive-anime.jp': {
        _name: 'Love Live 官网',
        www: [
            {
                title: '最新 NEWS',
                docs: 'https://docs.rsshub.app/anime.html#lovelive-anime-love-live-guan-wang-zui-xin-news',
                source: ['/', '/news'],
                target: '/lovelive-anime/news',
            },
            {
                title: '分类 Topics',
                docs: 'https://docs.rsshub.app/anime.html#lovelive-anime-love-live-guan-wang-fen-lei-topics',
                source: ['/:abbr/topics/', '/:abbr/topics/?cat=:category', '/:abbr/topics.php', '/:abbr/topics.php?cat=:category'],
                target: (params) => {
                    const category = 'category' in params ? params.category : '';
                    return `/lovelive-anime/topics/${params.abbr}/${category}`;
                },
            },
        ],
    },
};
