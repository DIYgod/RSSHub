module.exports = {
    'github.com': {
        _name: 'GitHub',
        '.': [
            {
                title: '仓库 Branches',
                docs: 'https://docs.rsshub.app/programming.html#github',
                source: ['/:user/:repo/branches', '/:user/:repo'],
                target: '/github/branches/:user/:repo',
            },
            {
                title: 'Issues / Pull Requests 评论',
                docs: 'https://docs.rsshub.app/programming.html#github',
                source: ['/:user/:repo/:type/:number'],
                target: '/github/comments/:user/:repo/:number',
            },
            {
                title: 'Issue & Pull Request comments',
                docs: 'https://docs.rsshub.app/programming.html#github',
                source: ['/:user/:repo/:type'],
                target: '/github/comments/:user/:repo',
            },
            {
                title: '仓库 Contributors',
                docs: 'https://docs.rsshub.app/programming.html#github',
                source: ['/:user/:repo/graphs/contributors', '/:user/:repo'],
                target: '/github/contributors/:user/:repo',
            },
            {
                title: '文件 Commits',
                docs: 'https://docs.rsshub.app/programming.html#github',
                source: '/:user/:repo/blob/:branch/*filepath',
                target: '/github/file/:user/:repo/:branch/:filepath',
            },
            {
                title: '仓库 Issue',
                docs: 'https://docs.rsshub.app/programming.html#github',
                source: ['/:user/:repo/issues', '/:user/:repo/issues/:id', '/:user/:repo'],
                target: '/github/issue/:user/:repo',
            },
            {
                title: '仓库 Pull Requests',
                docs: 'https://docs.rsshub.app/programming.html#github',
                source: ['/:user/:repo/pulls', '/:user/:repo/pulls/:id', '/:user/:repo'],
                target: '/github/pull/:user/:repo',
            },
            {
                title: '用户仓库',
                docs: 'https://docs.rsshub.app/programming.html#github',
                source: '/:user',
                target: '/github/repos/:user',
            },
            {
                title: '仓库 Stars',
                docs: 'https://docs.rsshub.app/programming.html#github',
                source: ['/:user/:repo/stargazers', '/:user/:repo'],
                target: '/github/stars/:user/:repo',
            },
            {
                title: '用户 Starred Repositories',
                docs: 'https://docs.rsshub.app/programming.html#github',
                source: '/:user',
                target: '/github/starred_repos/:user',
            },
            {
                title: 'Topics',
                docs: 'https://docs.rsshub.app/programming.html#github',
                source: '/topics',
                target: '/github/topics/:name/:qs?',
            },
            {
                title: 'Trending',
                docs: 'https://docs.rsshub.app/programming.html#github',
                source: '/trending',
                target: '/github/trending/:since',
            },
            {
                title: '用户 Followers',
                docs: 'https://docs.rsshub.app/programming.html#github',
                source: '/:user',
                target: '/github/user/followers/:user',
            },
            {
                title: 'Wiki 历史',
                docs: 'https://docs.rsshub.app/programming.html#github',
                source: ['/:user/:repo/wiki/:page/_history', '/:user/:repo/wiki/:page', '/:user/:repo/wiki/_history', '/:user/:repo/wiki'],
                target: '/github/wiki/:user/:repo/:page',
            },
            {
                title: 'Notifications 通知',
                docs: 'https://docs.rsshub.app/programming.html#github',
                source: ['/notifications'],
                target: '/github/notifications',
            },
        ],
        gist: [
            {
                title: 'Gist Commits',
                docs: 'https://docs.rsshub.app/programming.html#github',
                source: ['/:owner/:gistId/revisions', '/:owner/:gistId/stargazers', '/:owner/:gistId/forks', '/:owner/:gistId'],
                target: '/github/gist/:gistId',
            },
        ],
    },
};
