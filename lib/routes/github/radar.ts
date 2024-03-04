export default {
    'github.com': {
        _name: 'GitHub',
        '.': [
            {
                title: 'Repo branches',
                docs: 'https://docs.rsshub.app/routes/programming#github',
                source: ['/:user/:repo/branches', '/:user/:repo'],
                target: '/github/branches/:user/:repo',
            },
            {
                title: 'Issues / Pull Requests comments',
                docs: 'https://docs.rsshub.app/routes/programming#github',
                source: ['/:user/:repo/:type/:number'],
                target: '/github/comments/:user/:repo/:number',
            },
            {
                title: 'Issue & Pull Request comments',
                docs: 'https://docs.rsshub.app/routes/programming#github',
                source: ['/:user/:repo/:type'],
                target: '/github/comments/:user/:repo',
            },
            {
                title: 'Repo contributors',
                docs: 'https://docs.rsshub.app/routes/programming#github',
                source: ['/:user/:repo/graphs/contributors', '/:user/:repo'],
                target: '/github/contributors/:user/:repo',
            },
            {
                title: 'File commits',
                docs: 'https://docs.rsshub.app/routes/programming#github',
                source: '/:user/:repo/blob/:branch/*filepath',
                target: '/github/file/:user/:repo/:branch/:filepath',
            },
            {
                title: 'Repo issues',
                docs: 'https://docs.rsshub.app/routes/programming#github',
                source: ['/:user/:repo/issues', '/:user/:repo/issues/:id', '/:user/:repo'],
                target: '/github/issue/:user/:repo',
            },
            {
                title: 'Repo Pull Requests',
                docs: 'https://docs.rsshub.app/routes/programming#github',
                source: ['/:user/:repo/pulls', '/:user/:repo/pulls/:id', '/:user/:repo'],
                target: '/github/pull/:user/:repo',
            },
            {
                title: 'Pulse',
                docs: 'https://docs.rsshub.app/routes/programming#github',
                source: ['/:user/:repo/pulse', '/:user/:repo/pulse/:period'],
                target: '/github/pulse/:user/:repo/:period?',
            },
            {
                title: 'User repos',
                docs: 'https://docs.rsshub.app/routes/programming#github',
                source: '/:user',
                target: '/github/repos/:user',
            },
            {
                title: 'Repo stars',
                docs: 'https://docs.rsshub.app/routes/programming#github',
                source: ['/:user/:repo/stargazers', '/:user/:repo'],
                target: '/github/stars/:user/:repo',
            },
            {
                title: 'User starred repositories',
                docs: 'https://docs.rsshub.app/routes/programming#github',
                source: '/:user',
                target: '/github/starred_repos/:user',
            },
            {
                title: 'Topics',
                docs: 'https://docs.rsshub.app/routes/programming#github',
                source: '/topics',
                target: '/github/topics/:name/:qs?',
            },
            {
                title: 'Trending',
                docs: 'https://docs.rsshub.app/routes/programming#github',
                source: '/trending',
                target: '/github/trending/:since',
            },
            {
                title: 'User followers',
                docs: 'https://docs.rsshub.app/routes/programming#github',
                source: '/:user',
                target: '/github/user/followers/:user',
            },
            {
                title: 'Wiki history',
                docs: 'https://docs.rsshub.app/routes/programming#github',
                source: ['/:user/:repo/wiki/:page/_history', '/:user/:repo/wiki/:page', '/:user/:repo/wiki/_history', '/:user/:repo/wiki'],
                target: '/github/wiki/:user/:repo/:page',
            },
            {
                title: 'Notifications',
                docs: 'https://docs.rsshub.app/routes/programming#github',
                source: ['/notifications'],
                target: '/github/notifications',
            },
        ],
        gist: [
            {
                title: 'Gist Commits',
                docs: 'https://docs.rsshub.app/routes/programming#github',
                source: ['/:owner/:gistId/revisions', '/:owner/:gistId/stargazers', '/:owner/:gistId/forks', '/:owner/:gistId'],
                target: '/github/gist/:gistId',
            },
        ],
    },
};
