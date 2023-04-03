module.exports = {
    'civitai.com': {
        _name: 'Civitai',
        '.': [
            {
                title: 'Latest models',
                docs: 'https://docs.rsshub.app/program-update.html#civitai',
                source: '/',
                target: '/civitai/models',
            },
            {
                title: 'Discussions',
                docs: 'https://docs.rsshub.app/program-update.html#civitai',
                source: '/models/:modelId',
                target: '/civitai/discussions/:modelId',
            },
        ],
    },
};
