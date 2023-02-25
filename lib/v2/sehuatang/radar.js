module.exports = {
    'sehuatang.net': {
        _name: '色花堂',
        '.': [
            {
                title: '分区帖子',
                docs: 'https://docs.rsshub.app/multimedia.html#se-hua-tang-fen-qu-tie-zi',
                source: ['/:category', '/'],
                target: (params, url) => {
                    const theUrl = new URL(url);
                    const matches = theUrl.href.match(/forum-(\d)+-\d+/);
                    const fid = theUrl.searchParams.get('fid') || (matches ? matches[1] : '');
                    const tid = theUrl.searchParams.get('typeid');
                    return `/sehuatang${fid ? `/${fid}` : ''}${tid ? `/${tid}` : ''}`;
                },
            },
        ],
    },
};
