export default {
    'sciencedirect.com': {
        _name: 'Elsevier',
        www: [
            {
                title: 'Journal',
                docs: 'https://docs.rsshub.app/routes/journal#Elsevier',
                source: '/journal/:journal/*',
                target: '/elsevier/:journal',
            },
            {
                title: 'Issue',
                docs: 'https://docs.rsshub.app/routes/journal#Elsevier',
                source: '/journal/:journal/vol/:issue',
                target: '/elsevier/:journal/:issue',
            },
        ],
    },
};
