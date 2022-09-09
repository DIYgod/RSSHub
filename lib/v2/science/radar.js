module.exports = {
    'science.org': {
        _name: 'Science Magazine',
        '.': [
            {
                title: '本期刊物',
                docs: 'https://docs.rsshub.app/journal.html#science-xi-lie',
                source: ['/journal/:journal', '/toc/:journal/current'],
                target: '/science/current/:journal',
            },
            {
                title: '封面故事',
                docs: 'https://docs.rsshub.app/journal.html#science-xi-lie',
                source: ['/'],
                target: '/science/cover',
            },
            {
                title: '在线发表',
                docs: 'https://docs.rsshub.app/journal.html#science-xi-lie',
                source: ['/journal/:journal', '/toc/:journal/0/0'],
                target: '/science/early/:journal',
            },
        ],
    },
};
