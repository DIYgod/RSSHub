module.exports = {
    'showstart.com': {
        _name: '秀动网',
        www: [
            {
                title: '演出更新',
                docs: 'https://docs.rsshub.app/routes/shopping#xiu-dong-wang-yan-chu-geng-xin',
                target: (_, url) => {
                    const search = new URL(url).searchParams;
                    const cityCode = search.get('cityCode') || 0;
                    const showStyle = search.get('showStyle') || 0;
                    const keyword = search.get('keyword') || '';
                    return `/showstart/event/${cityCode}/${showStyle}/${keyword}`;
                },
            },
        ],
    },
};
