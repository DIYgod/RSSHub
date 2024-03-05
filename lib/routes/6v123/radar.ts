const radarConfig = {
    _name: '6v电影',
    '.': [
        {
            title: '最新电影',
            docs: 'https://docs.rsshub.app/routes/multimedia#6v-dian-ying',
            source: ['/', '/gvod/zx.html'],
            target: '/6v123/latestMovies',
        },
        {
            title: '最新电视剧',
            docs: 'https://docs.rsshub.app/routes/multimedia#6v-dian-ying',
            source: ['/', '/gvod/dsj.html'],
            target: '/6v123/latestTVSeries',
        },
    ],
};

export default {
    'hao6v.cc': radarConfig,
    'hao6v.tv': radarConfig,
    'hao6v.com': radarConfig,
};
