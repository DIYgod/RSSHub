module.exports = {
    'hellogithub.com': {
        _name: 'HelloGitHub',
        '.': [
            {
                title: '热门',
                docs: 'https://docs.rsshub.app/programming.html#hellogithub-re-men',
                source: ['/'],
                target: (params, url) => {
                    const sort = new URL(url).searchParams.get('sort_by');
                    const id = new URL(url).searchParams.get('tid');
                    return `/hellogithub${sort ? `/sort` : ''}${id ? `/id` : ''}`;
                },
            },
            {
                title: '最近',
                docs: 'https://docs.rsshub.app/programming.html#hellogithub-zui-jin',
                source: ['/'],
                target: (params, url) => {
                    const sort = new URL(url).searchParams.get('sort_by');
                    const id = new URL(url).searchParams.get('tid');
                    return `/hellogithub${sort ? `/sort` : ''}${id ? `/id` : ''}`;
                },
            },
            {
                title: '文章',
                docs: 'https://docs.rsshub.app/programming.html#hellogithub-wen-zhang',
                source: ['/'],
                target: (params, url) => {
                    const sort = new URL(url).searchParams.get('sort_by');
                    const id = new URL(url).searchParams.get('tid');
                    return `/hellogithub/article${sort ? `/sort` : ''}${id ? `/id` : ''}`;
                },
            },
            {
                title: '排行榜',
                docs: 'https://docs.rsshub.app/programming.html#hellogithub-pai-hang-bang',
                source: ['/report/:type', '/'],
                target: '/hellogithub/report/:type',
            },
            {
                title: '月刊',
                docs: 'https://docs.rsshub.app/programming.html#hellogithub-yue-kan',
                source: ['/periodical/volume/:id', '/'],
                target: '/hellogithub/volume',
            },
        ],
    },
};
