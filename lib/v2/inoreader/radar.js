module.exports = {
    'inoreader.com': {
        _name: 'Inoreader',
        '.': [
            {
                title: 'HTML Clip',
                docs: 'https://docs.rsshub.app/reading.html#inoreader',
                source: ['/'],
                target: (params, url) => {
                    const origin = new URL(url);
                    const path = origin.pathname.split('/');
                    const limit = origin.searchParams.get('n');
                    return `/inoreader/html_clip/${path[path.findIndex('user') + 1]}/${path[path.findIndex('tag') + 1]}` + (limit ? `?limit=${limit}` : '');
                },
            },
        ],
    },
};
