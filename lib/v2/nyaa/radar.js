module.exports = {
    'nyaa.si': {
        _name: 'nyaa',
        '.': [
            {
                title: 'nyaa 的搜索结果、指定用户、指定用户的搜索结果',
                docs: 'https://docs.rsshub.app/multimedia.html#nyaa',
                source: ['/', '/user/:username'],
                target: (params, url) => {
                    url = new URL(url);
                    const username = params.username;
                    const query = url.searchParams.get('q');

                    let currentURL = '/nyaa';
                    if (username !== undefined) {
                        currentURL = `${currentURL}/user/${username}`;
                    }
                    if (query !== null) {
                        currentURL = `${currentURL}/search/${query}`;
                    }
                    return currentURL;
                },
            },
        ],
        sukebei: [
            {
                title: 'sukebei 的搜索结果、指定用户、指定用户的搜索结果',
                docs: 'https://docs.rsshub.app/multimedia.html#nyaa',
                source: ['/', '/user/:username'],
                target: (params, url) => {
                    url = new URL(url);
                    const username = params.username;
                    const query = url.searchParams.get('q');

                    let currentURL = '/nyaa/sukebei';
                    if (username !== undefined) {
                        currentURL = `${currentURL}/user/${username}`;
                    }
                    if (query !== null) {
                        currentURL = `${currentURL}/search/${query}`;
                    }
                    return currentURL;
                },
            },
        ],
    },
};
