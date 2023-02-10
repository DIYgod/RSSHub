module.exports = {
    'issuehunt.io': {
        _name: 'Issue Hunt',
        '.': [
            {
                title: '悬赏',
                docs: 'https://docs.rsshub.app/programming.html#issue-hunt-xiang-mu-xuan-shang',
                source: '/r/:username/:repo',
                target: ({ username, repo }) => `/issuehunt/funded/${username}/${repo}`,
            },
        ],
    },
};
