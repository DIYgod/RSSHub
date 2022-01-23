module.exports = {
    'ycombinator.com': {
        _name: 'Hacker News',
        '.': [
            {
                title: 'Section',
                docs: 'https://docs.rsshub.app/programming.html#hacker-news',
                source: ['/:section', '/'],
                target: '/hackernews/:section?/:type?',
            },
        ],
    },
};
