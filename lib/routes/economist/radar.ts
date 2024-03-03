export default {
    'economist.com': {
        _name: 'The Economist',
        '.': [
            {
                title: '分类',
                docs: 'https://docs.rsshub.app/routes/traditional-media#the-economist',
                source: ['/:endpoint'],
                target: '/economist/:endpoint',
            },
            {
                title: 'Espresso',
                docs: 'https://docs.rsshub.app/routes/traditional-media#the-economist',
                source: ['/the-world-in-brief', '/espresso'],
                target: '/economist/espresso',
            },
        ],
    },
    'businessreview.global': {
        _name: 'The Economist',
        '.': [
            {
                title: '商论',
                docs: 'https://docs.rsshub.app/routes/traditional-media#the-economist',
                source: ['/'],
                target: '/economist/global-business-review',
            },
        ],
    },
};
