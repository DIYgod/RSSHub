module.exports = {
    'sciencedirect.com': {
        _name: 'Elsevier',
        www: [
            {
                title: 'Journal',
                docs: 'https://docs.rsshub.app/journal.html#Elsevier',
                source: '/journal/:journal/*',
                target: '/elsevier/:journal',
            },
            {
                title: 'Issue',
                docs: 'https://docs.rsshub.app/journal.html#Elsevier',
                source: '/journal/:journal/vol/:issue',
                target: '/elsevier/:journal/:issue',
            },
        ],
    },
};
