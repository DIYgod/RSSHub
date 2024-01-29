module.exports = {
    'modrinth.com': {
        _name: 'Modrinth',
        '.': [
            {
                title: 'Project versions',
                docs: 'https://docs.rsshub.app/routes/game#modrinth-project-versions',
                source: ['/*/:id/*'],
                target: '/modrinth/project/:id/versions',
            },
        ],
    },
};
