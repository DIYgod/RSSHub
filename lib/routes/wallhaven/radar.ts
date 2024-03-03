export default {
    'wallhaven.cc': {
        _name: 'wallhaven',
        '.': [
            {
                title: 'Latest',
                docs: 'https://docs.rsshub.app/routes/picture#wallhaven-zhu-zhu-ti',
                source: ['/:category', '/'],
                target: (params) => {
                    if (params.category === 'latest') {
                        return '/wallhaven/latest';
                    }
                },
            },
            {
                title: 'Hot',
                docs: 'https://docs.rsshub.app/routes/picture#wallhaven-zhu-zhu-ti',
                source: ['/:category', '/'],
                target: (params) => {
                    if (params.category === 'hot') {
                        return '/wallhaven/hot';
                    }
                },
            },
            {
                title: 'TopList',
                docs: 'https://docs.rsshub.app/routes/picture#wallhaven-zhu-zhu-ti',
                source: ['/:category', '/'],
                target: (params) => {
                    if (params.category === 'toplist') {
                        return '/wallhaven/toplist';
                    }
                },
            },
            {
                title: 'Random',
                docs: 'https://docs.rsshub.app/routes/picture#wallhaven-zhu-zhu-ti',
                source: ['/:category', '/'],
                target: (params) => {
                    if (params.category === 'random') {
                        return '/wallhaven/random';
                    }
                },
            },
            {
                title: 'Search',
                docs: 'https://docs.rsshub.app/routes/picture#wallhaven-sou-xiao-sou-shao-suo',
                source: ['/'],
                target: '/wallhaven/search/:filter?/:needDetails?',
            },
        ],
    },
};
