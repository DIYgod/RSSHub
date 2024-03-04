export default {
    'civitai.com': {
        _name: 'Civitai',
        '.': [
            {
                title: 'Latest models',
                docs: 'https://docs.rsshub.app/routes/program-update#civitai',
                source: '/',
                target: '/civitai/models',
            },
            {
                title: 'Discussions',
                docs: 'https://docs.rsshub.app/routes/program-update#civitai',
                source: '/models/:modelId',
                target: '/civitai/discussions/:modelId',
            },
        ],
    },
};
