module.exports = {
    'gitee.com': {
        _name: 'Gitee',
        '.': [
            {
                title: '仓库 Releases',
                link: 'https://docs.rsshub.app',
                source: ['/:owner/:repo/releases'],
                target: '/gitee/releases/:owner/:repo',
            },
            {
                title: '仓库提交',
                link: 'https://docs.rsshub.app',
                source: ['/:owner/:repo/commits'],
                target: '/gitee/commits/:owner/:repo',
            },
            {
                title: '用户公开动态',
                link: 'https://docs.rsshub.app',
                source: ['/:username'],
                target: '/gitee/events/:username',
            },
            {
                title: '仓库动态',
                link: 'https://docs.rsshub.app',
                source: ['/:owner/:repo'],
                target: '/gitee/events/:owner/:repo',
            },
        ],
    },
};
