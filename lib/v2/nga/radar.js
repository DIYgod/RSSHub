module.exports = {
    'nga.cn': {
        _name: 'NGA',
        bbs: [
            {
                title: '分区帖子',
                docs: 'https://docs.rsshub.app/bbs.html#nga',
                source: '/thread.php',
                target: (params, url) => new URL(url).searchParams.get('fid') && `/nga/forum/${new URL(url).searchParams.get('fid')}`,
            },
            {
                title: '帖子',
                docs: 'https://docs.rsshub.app/bbs.html#nga',
                source: '/read.php',
                target: (params, url) => new URL(url).searchParams.get('tid') && `/nga/post/${new URL(url).searchParams.get('tid')}`,
            },
        ],
    },
    '178.com': {
        _name: 'NGA',
        nga: [
            {
                title: '分区帖子',
                docs: 'https://docs.rsshub.app/bbs.html#nga-fen-qu-tie-zi',
                source: ['/thread.php'],
                target: (params, url) => {
                    const fid = new URL(url).searchParams.get('fid');
                    return `/nga/forum/${fid}`;
                },
            },
            {
                title: '帖子',
                docs: 'https://docs.rsshub.app/bbs.html#nga-tie-zi',
                source: ['/read.php'],
                target: (params, url) => {
                    const tid = new URL(url).searchParams.get('tid');
                    return `/nga/post/${tid}`;
                },
            },
        ],
    },
};
