export default {
    'gitee.com': {
        _name: 'Gitee',
        '.': [
            {
                title: '仓库 Releases',
                docs: 'https://docs.rsshub.app/routes/programming#gitee',
                source: ['/:owner/:repo/releases'],
                target: '/gitee/releases/:owner/:repo',
            },
            {
                title: '仓库提交',
                docs: 'https://docs.rsshub.app/routes/programming#gitee',
                source: ['/:owner/:repo/commits'],
                target: '/gitee/commits/:owner/:repo',
            },
            {
                title: '用户公开动态',
                docs: 'https://docs.rsshub.app/routes/programming#gitee',
                source: ['/:username'],
                target: '/gitee/events/:username',
            },
            {
                title: '仓库动态',
                docs: 'https://docs.rsshub.app/routes/programming#gitee',
                source: ['/:owner/:repo'],
                target: '/gitee/events/:owner/:repo',
            },
        ],
    },
};
