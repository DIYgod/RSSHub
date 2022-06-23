module.exports = {
    'itch.io': {
        _name: 'itch.io',
        '.': [
            {
                title: 'Browse',
                docs: 'https://docs.rsshub.app/game.html#itch-io-browse',
                source: ['/'],
                target: (params, url) => `/itch${new URL(url).toString().split('itch.io').pop()}`,
            },
            {
                title: 'Developer Logs',
                docs: 'https://docs.rsshub.app/game.html#itch-io-developer-logs',
                source: ['/'],
                target: (params, url) => {
                    const matches = new URL(url).toString().match(/\/\/(.*?)\.itch\.io\/(.*?)\/devlog/);
                    return `/itch/devlog/${matches[1]}/${matches[2]}`;
                },
            },
            {
                title: 'Posts',
                docs: 'https://docs.rsshub.app/game.html#itch-io-posts',
                source: ['/t/:topic/:id'],
                target: '/itch/posts/:topic/:id',
            },
        ],
    },
};
