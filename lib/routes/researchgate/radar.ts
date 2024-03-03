export default {
    'researchgate.net': {
        _name: 'ResearchGate',
        '.': [
            {
                title: 'Publications',
                docs: 'https://docs.rsshub.app/routes/study#researchgate',
                source: ['/profile/:username'],
                target: '/researchgate/publications/:username',
            },
        ],
    },
};
