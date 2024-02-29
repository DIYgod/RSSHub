const rules = [
    {
        title: '分区帖子',
        docs: 'https://docs.rsshub.app/routes/bbs#nga-fen-qu-tie-zi',
        source: '/thread.php',
        target: (params, url) => new URL(url).searchParams.get('fid') && `/nga/forum/${new URL(url).searchParams.get('fid')}`,
    },
    {
        title: '帖子',
        docs: 'https://docs.rsshub.app/routes/bbs#nga-tie-zi',
        source: '/read.php',
        target: (params, url) => new URL(url).searchParams.get('tid') && `/nga/post/${new URL(url).searchParams.get('tid')}`,
    },
    {
        title: '帖子 - 只看作者',
        docs: 'https://docs.rsshub.app/routes/bbs#nga-tie-zi',
        source: '/read.php',
        target: (params, url, document) => {
            const tid = new URL(url).searchParams.get('tid');
            const authorId = document.documentElement.innerHTML.match(/commonui\.userInfo\.setAll\(\s{3}{"(\d+)"/)[1];
            return `/nga/post/${tid}/${authorId}`;
        },
    },
];

module.exports = {
    'nga.cn': {
        _name: 'NGA',
        bbs: rules,
    },
    '178.com': {
        _name: 'NGA',
        nga: rules,
    },
    'ngabbs.com': {
        _name: 'NGA',
        '.': rules,
    },
};
