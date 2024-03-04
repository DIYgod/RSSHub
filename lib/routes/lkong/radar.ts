export default {
    'lkong.com': {
        _name: '龙空',
        '.': [
            {
                title: '分区',
                docs: 'https://docs.rsshub.app/routes/bbs#long-kong-fen-qu',
                source: ['/forum/:id', '/'],
                target: '/lkong/forum/:id?/:digest?',
            },
            {
                title: '帖子',
                docs: 'https://docs.rsshub.app/routes/bbs#long-kong-tie-zi',
                source: ['/thread/:id', '/'],
                target: '/lkong/thread/:id',
            },
        ],
    },
};
