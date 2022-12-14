module.exports = {
    'researchgate.net': {
        _name: 'ResearchGate',
        '.': [
            {
                title: 'Publications',
                docs: 'https://docs.rsshub.app/study.html#researchgate',
                source: ['/profile/:username'],
                target: '/researchgate/publications/:username',
            },
        ],
    },
};
