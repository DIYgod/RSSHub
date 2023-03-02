module.exports = {
    'nltimes.nl': {
        _name: 'NL Times',
        '.': [
            {
                title: 'News',
                docs: 'https://docs.rsshub.app/new-media.html#nl-times',
                source: '/categories/:category',
                target: '/nltimes/news/:category',
            },
            {
                title: 'News',
                docs: 'https://docs.rsshub.app/new-media.html#nl-times',
                source: '/top-stories',
                target: '/nltimes/news/top-stories',
            },
        ],
    },
};
