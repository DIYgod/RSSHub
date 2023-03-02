module.exports = {
    'lvv2.com': {
        _name: 'LVV2',
        '.': [
            {
                title: '热门',
                docs: 'https://docs.rsshub.app/new-media.html#lvv2',
                source: ['/sort-hot'],
                target: '/lvv2/news/sort-hot',
            },
            {
                title: '最新',
                docs: 'https://docs.rsshub.app/new-media.html#lvv2',
                source: ['/sort-new'],
                target: '/lvv2/news/sort-new',
            },
            {
                title: '得分',
                docs: 'https://docs.rsshub.app/new-media.html#lvv2',
                source: ['/sort-score', '/sort-score/:sort'],
                target: (params) => {
                    if (!params.sort) {
                        return '/lvv2/news/sort-score';
                    } else {
                        return `/lvv2/news/sort-score/${params.sort}`;
                    }
                },
            },
            {
                title: '24小时榜',
                docs: 'https://docs.rsshub.app/new-media.html#lvv2',
                source: ['/sort-realtime', '/sort-realtime/:sort'],
                target: (params) => {
                    if (!params.sort) {
                        return '/lvv2/news/sort-realtime';
                    } else {
                        return `/lvv2/news/sort-realtime/${params.sort}`;
                    }
                },
            },
            {
                title: '热门 24小时 Top 10',
                docs: 'https://docs.rsshub.app/new-media.html#lvv2',
                source: ['/', '/sort-hot'],
                target: '/lvv2/top/sort-hot',
            },
            {
                title: '最新 24小时 Top 10',
                docs: 'https://docs.rsshub.app/new-media.html#lvv2',
                source: ['/sort-new'],
                target: '/lvv2/top/sort-new',
            },
            {
                title: '得分 24小时 Top 10',
                docs: 'https://docs.rsshub.app/new-media.html#lvv2',
                source: ['/sort-score', '/sort-score/:sort'],
                target: (params) => {
                    if (!params.sort) {
                        return '/lvv2/top/sort-score';
                    } else {
                        return `/lvv2/top/sort-score/${params.sort}`;
                    }
                },
            },
            {
                title: '24小时榜 24小时 Top 10',
                docs: 'https://docs.rsshub.app/new-media.html#lvv2',
                source: ['/sort-realtime', '/sort-realtime/:sort'],
                target: (params) => {
                    if (!params.sort) {
                        return '/lvv2/top/sort-realtime';
                    } else {
                        return `/lvv2/top/sort-realtime/${params.sort}`;
                    }
                },
            },
        ],
    },
};
