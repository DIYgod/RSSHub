export default {
    'ycombinator.com': {
        _name: 'Hacker News',
        '.': [
            {
                title: 'Section',
                docs: 'https://docs.rsshub.app/routes/programming#hacker-news',
                source: ['/:section', '/'],
                target: '/hackernews/:section?/:type?/:user?',
            },
        ],
    },
};
