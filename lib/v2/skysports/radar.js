module.exports = {
    'skysports.com': {
        _name: 'Sky Sports',
        '.': [
            {
                title: 'News',
                docs: 'https://docs.rsshub.app/new-media.html#sky-sports-news',
                source: ['/'],
                target: (params, url) => `/skysports/news/${new URL(url).toString().match(/\/(.*)-news$/)[1]}`,
            },
        ],
    },
};
