module.exports = {
    'pornhub.com': {
        _name: 'PornHub',
        '.': [
            {
                title: 'Category',
                docs: 'https://docs.rsshub.app/routes/multimedia#pornhub',
                source: ['/categories/:caty', '/video'],
                target: (params, url) => {
                    if (params.caty) {
                        return `/pornhub/category/${params.caty}`;
                    }
                    return `/pornhub/category/${new URL(url).searchParams.get('c')}`;
                },
            },
            {
                title: 'Keyword Search',
                docs: 'https://docs.rsshub.app/routes/multimedia#pornhub',
                source: ['/video/search'],
                target: (_, url) => `/pornhub/category/${new URL(url).searchParams.get('search')}`,
            },
            {
                title: 'Users',
                docs: 'https://docs.rsshub.app/routes/multimedia#pornhub',
                source: ['/users/:username/*'],
                target: '/pornhub/users/:username',
            },
            {
                title: 'Verified amateur / Model',
                docs: 'https://docs.rsshub.app/routes/multimedia#pornhub',
                source: ['/model/:username/*'],
                target: '/pornhub/model/:username',
            },
            {
                title: 'Verified model / Pornstar',
                docs: 'https://docs.rsshub.app/routes/multimedia#pornhub',
                source: ['/pornstar/:username/*'],
                target: '/pornhub/pornstar/:username',
            },
            {
                title: 'Video List',
                docs: 'https://docs.rsshub.app/routes/multimedia#pornhub',
            },
        ],
    },
};
