module.exports = {
    'scitation.org': {
        _name: 'scitation',
        '.': [
            {
                title: 'latest',
                docs: 'https://docs.rsshub.app/journal.html#scitation',
                source: ':pub.scitation.org/toc/:jrn',
                target: '/:pub/:jrn',
            },
            {
                title: 'section',
                docs: 'https://docs.rsshub.app/journal.html#scitation',
                source: ':pub.scitation.org/toc/:jrn',
                target: (params, url) => `/:pub/:jrn/${new URL(url).searchParams.get('tocSection')}`,
            },
        ],
    },
};
