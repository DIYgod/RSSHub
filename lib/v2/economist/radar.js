module.exports = {
    'economist.com': {
        _name: 'The Economist',
        '.': [
            {
                title: '分类',
                docs: 'https://docs.rsshub.app/traditional-media.html#the-economist',
                source: ['/:endpoint'],
                target: '/economist/:endpoint',
            },
            {
                title: 'Espresso',
                docs: 'https://docs.rsshub.app/traditional-media.html#the-economist',
                source: ['/the-world-in-brief', '/espresso'],
                target: '/economist/espresso',
            },
        ],
        gre: [
            {
                title: 'GRE Vocabulary',
                docs: 'https://docs.rsshub.app/traditional-media.html#the-economist',
                source: ['/', '/gre-advice/gre-vocabulary/which-words-study/most-common-gre-vocabulary-list-organized-difficulty'],
                target: '/economist/gre-vocabulary',
            },
        ],
    },
    'businessreview.global': {
        _name: 'The Economist',
        '.': [
            {
                title: '商论',
                docs: 'https://docs.rsshub.app/traditional-media.html#the-economist',
                source: ['/'],
                target: '/economist/global-business-review',
            },
        ],
    },
};
