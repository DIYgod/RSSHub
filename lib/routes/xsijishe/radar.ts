export default {
    'xsijishe.com': {
        _name: '司机社',
        '.': [
            {
                title: '论坛',
                docs: 'https://docs.rsshub.app/routes/bbs#si-ji-she',
                source: ['/*'],
                target: (_, url) => {
                    const re = /forum-(\d+)-/;
                    const res = re.exec(url);
                    if (res) {
                        return `/xsijishe/forum/${res[1]}`;
                    }
                },
            },
            {
                title: '周排行榜',
                docs: 'https://docs.rsshub.app/routes/bbs#si-ji-she',
                source: ['/*'],
                target: '/xsijishe/rank/weekly',
            },
            {
                title: '月排行榜',
                docs: 'https://docs.rsshub.app/routes/bbs#si-ji-she',
                source: ['/*'],
                target: '/xsijishe/rank/monthly',
            },
        ],
    },
};
