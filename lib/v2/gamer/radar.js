module.exports = {
    'gamer.com.tw': {
        _name: '巴哈姆特電玩資訊站',
        acg: [
            {
                title: 'GNN 新聞',
                docs: 'https://docs.rsshub.app/bbs.html#ba-ha-mu-te-dian-wan-zi-xun-zhan',
                source: ['/news.php'],
                target: (params, url) => `/gamer/gnn/${new URL(url).searchParams.get('p')}`,
            },
        ],
        forum: [
            {
                title: '熱門推薦',
                docs: 'https://docs.rsshub.app/bbs.html#ba-ha-mu-te-dian-wan-zi-xun-zhan',
                source: ['/A.php', '/B.php'],
                target: (params, url) => `/gamer/hot/${new URL(url).searchParams.get('bsn')}`,
            },
        ],
        gnn: [
            {
                title: 'GNN 新聞',
                docs: 'https://docs.rsshub.app/bbs.html#ba-ha-mu-te-dian-wan-zi-xun-zhan',
                source: ['/index.php'],
                target: (params, url) => `/gamer/gnn/${new URL(url).searchParams.get('k')}`,
            },
        ],
    },
};
