module.exports = {
    'sciencedirect.com': {
        _name: 'Elsevier',
        www: [
            {
                title: 'latest',
                docs: 'https://docs.rsshub.app/journal.html#Elsevier',
                source: '/journal/:journal/*',
                target: '/elsevier/:journal/latest',
            },
            {
                title: 'volume',
                docs: 'https://docs.rsshub.app/journal.html#Elsevier',
                source: '/journal/:journal/vol/:id',
                target: '/elsevier/:journal/vol/:id',
            },
        ],
    },
};
