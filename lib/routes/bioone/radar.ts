export default {
    'bioone.org': {
        _name: 'BioOne',
        '.': [
            {
                title: 'Featured articles',
                docs: 'https://docs.rsshub.app/routes/journal#bioone-featured-articles',
                source: '/',
                target: '/bioone/featured',
            },
            {
                title: 'Journals',
                docs: 'https://docs.rsshub.app/routes/journal#bioone-journals',
                source: ['/journals/:journal', '/'],
                target: '/bioone/journals/:journal',
            },
        ],
    },
};
