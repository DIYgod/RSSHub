module.exports = {
    'nyaa.si': {
        _name: 'nyaa',
        '.': [
            {
                title: '搜索结果',
                docs: 'https://docs.rsshub.app/multimedia.html#nyaa-sou-suo-jie-guo',
                source: '/',
                target: (params, url) => {
                    url = new URL(url);
                    if (url.hostname.split('.')[0] === 'nyaa') {
                        const searchParams = url.searchParams;
                        const query = searchParams.has('q') ? searchParams.get('q') : '';
                        return `/nyaa/search/${query}`;
                    }
                },
            },
            {
                title: '用户',
                docs: 'https://docs.rsshub.app/multimedia.html#nyaa-yong-hu',
                source: '/user/:username',
                target: (params, url) => {
                    url = new URL(url);
                    if (url.hostname.split('.')[0] === 'nyaa') {
                        return `/nyaa/user/${params.username}`;
                    }
                },
            },
        ],
        sukebei: [
            {
                title: 'sukebei 搜索结果',
                docs: 'https://docs.rsshub.app/multimedia.html#nyaa-sukebei-sou-suo-jie-guo',
                source: '/',
                target: (params, url) => {
                    const searchParams = new URL(url).searchParams;
                    const query = searchParams.has('q') ? searchParams.get('q') : '';
                    return `/nyaa/sukebei/search/${query}`;
                },
            },
            {
                title: 'sukebei 用户',
                docs: 'https://docs.rsshub.app/multimedia.html#nyaa-sukebei-yong-hu',
                source: '/user/:username',
                target: (params) => `/nyaa/sukebei/user/${params.username}`,
            },
        ],
    },
};
