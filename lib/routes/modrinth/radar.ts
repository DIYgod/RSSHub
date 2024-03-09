export default {
    'modrinth.com': {
        _name: 'Modrinth',
        '.': [
            {
                title: 'Project versions',
                docs: 'https://docs.rsshub.app/routes/game#modrinth-project-versions',
                source: ['/mod/:id/*', '/plugin/:id/*', '/datapack/:id/*', '/shader/:id/*', '/resourcepack/:id/*', '/modpack/:id/*', '/mod/:id', '/plugin/:id', '/datapack/:id', '/shader/:id', '/resourcepack/:id', '/modpack/:id'],
                target: '/modrinth/project/:id/versions',
            },
        ],
    },
};
