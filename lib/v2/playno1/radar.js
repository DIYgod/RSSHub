module.exports = {
    'playno1.com': {
        _name: 'PLAYNO.1玩樂達人',
        stno1: [
            {
                title: '情趣',
                docs: 'https://docs.rsshub.app/bbs.html#playno-1-wan-le-da-ren',
                source: ['/stno1/:catid/'],
                target: '/playno1/st/:catid',
            },
        ],
        www: [
            {
                title: 'AV',
                docs: 'https://docs.rsshub.app/bbs.html#playno-1-wan-le-da-ren',
                source: ['/portal.php'],
                target: (_params, url) => `/playno1/av/${new URL(url).searchParams.get('catid')}`,
            },
        ],
    },
};
