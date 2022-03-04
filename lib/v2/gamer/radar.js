module.exports = {
    'gamer.com.tw': {
        _name: '巴哈姆特電玩資訊站',
        forum: [
            {
                title: '熱門推薦',
                docs: 'https://docs.rsshub.app/bbs.html#ba-ha-mu-te-dian-wan-zi-xun-zhan',
                source: ['/A.php', '/B.php'],
                target: (params, url) => `/gamer/hot/${new URL(url).searchParams.get('bsn')}`,
            },
        ],
    },
};
