module.exports = {
    'bsky.app': {
        _name: 'Bluesky',
        '.': [
            {
                title: '关键词',
                docs: 'https://docs.rsshub.app/routes/social-media#bluesky-bsky',
                source: '/search',
                target: (params, url) => `/bsky/keyword/${new URL(url).searchParams.get('q')}`,
            },
        ],
    },
};
