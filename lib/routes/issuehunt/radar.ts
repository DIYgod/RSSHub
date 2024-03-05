export default {
    'issuehunt.io': {
        _name: 'Issue Hunt',
        '.': [
            {
                title: '项目悬赏',
                docs: 'https://docs.rsshub.app/routes/programming#issue-hunt-xiang-mu-xuan-shang',
                source: '/r/:username/:repo',
                target: ({ username, repo }) => `/issuehunt/funded/${username}/${repo}`,
            },
        ],
    },
};
