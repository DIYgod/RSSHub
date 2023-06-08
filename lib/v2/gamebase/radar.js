module.exports = {
    'gamebase.com.tw': {
        _name: '遊戲基地 Gamebase',
        news: [
            {
                title: '新聞',
                docs: 'https://docs.rsshub.app/game.html#gamebase-xin-wen',
                source: ['/news/:type'],
                target: (params, url) => `/gamebase/news/${params.type}/${new URL(url).searchParams.get('type')}`,
            },
        ],
    },
};
