export default {
    'gamer.com.tw': {
        _name: '巴哈姆特電玩資訊站',
        acg: [
            {
                title: 'GNN 新聞',
                docs: 'https://docs.rsshub.app/routes/anime#ba-ha-mu-te-dian-wan-zi-xun-zhan',
                source: ['/news.php'],
                target: (params, url) => `/gamer/gnn/${new URL(url).searchParams.get('p')}`,
            },
        ],
        ani: [
            {
                title: '動畫瘋 - 最後更新',
                docs: 'https://docs.rsshub.app/routes/anime#ba-ha-mu-te-dian-wan-zi-xun-zhan',
                source: ['/'],
                target: '/gamer/new_anime',
            },
            {
                title: '動畫瘋 - 動畫',
                docs: 'https://docs.rsshub.app/routes/anime#ba-ha-mu-te-dian-wan-zi-xun-zhan',
                source: ['/animeVideo.php'],
                target: (_params, url) => `/gamer/anime/${new URL(url).searchParams.get('sn')}`,
            },
        ],
        forum: [
            {
                title: '熱門推薦',
                docs: 'https://docs.rsshub.app/routes/anime#ba-ha-mu-te-dian-wan-zi-xun-zhan',
                source: ['/A.php', '/B.php'],
                target: (params, url) => `/gamer/hot/${new URL(url).searchParams.get('bsn')}`,
            },
        ],
        gnn: [
            {
                title: 'GNN 新聞',
                docs: 'https://docs.rsshub.app/routes/anime#ba-ha-mu-te-dian-wan-zi-xun-zhan',
                source: ['/index.php'],
                target: (params, url) => `/gamer/gnn/${new URL(url).searchParams.get('k')}`,
            },
        ],
    },
};
