export default {
    'lovelive-anime.jp': {
        _name: 'Love Live 官网',
        www: [
            {
                title: '最新 NEWS',
                docs: 'https://docs.rsshub.app/routes/anime#lovelive-anime-love-live-guan-wang-zui-xin-news',
                source: ['/', '/news'],
                target: '/lovelive-anime/news',
            },
            {
                title: '分类 Topics',
                docs: 'https://docs.rsshub.app/routes/anime#lovelive-anime-love-live-guan-wang-fen-lei-topics',
                source: ['/:abbr/topics/', '/:abbr/topics.php'],
                target: (params, url) => {
                    const cat = url.match(/\?cat=(.*)/);
                    return `/lovelive-anime/topics/${params.abbr}/${null !== cat && cat.length === 2 ? cat[1] : ''}`;
                },
            },
            {
                title: 'Schedule',
                docs: 'https://docs.rsshub.app/routes/anime#lovelive-anime-love-live-guan-wang-schedule',
                source: ['/schedule/'],
                target: (params, url) => {
                    const cat = url.match(/\?series=(.*)&category=(.*)/);
                    return `/lovelive-anime/schedules/${null !== cat && cat.length >= 2 ? cat[1] : ''}/${null !== cat && cat.length === 3 ? cat[2] : ''}`;
                },
            },
        ],
    },
};
