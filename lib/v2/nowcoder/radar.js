module.exports = {
    'nowcoder.com': {
        _name: '牛客网',
        '.': [
            {
                title: '面经',
                docs: 'https://docs.rsshub.app/bbs.html#niu-ke-wang-mian-jing',
                source: ['/'],
                target: '/nowcoder/experience',
            },
            {
                title: '讨论区',
                docs: 'https://docs.rsshub.app/bbs.html#niu-ke-wang',
                source: ['/discuss'],
                target: (_params, url) => {
                    const href = new URL(url);
                    return `/nowcoder/${href.searchParams.get('type')}/${href.searchParams.get('order')}`;
                },
            },
            {
                title: '实习广场 & 社招广场',
                docs: 'https://docs.rsshub.app/bbs.html#niu-ke-wang',
                source: ['/'],
                target: '/nowcoder/jobcenter',
            },
            {
                title: '校招日程',
                docs: 'https://docs.rsshub.app/bbs.html#niu-ke-wang',
                source: ['/'],
                target: '/nowcoder/schedule',
            },
            {
                title: '求职推荐',
                docs: 'https://docs.rsshub.app/bbs.html#niu-ke-wang',
                source: ['/'],
                target: '/nowcoder/recommend',
            },
        ],
    },
};
