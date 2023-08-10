module.exports = {
    'aip.org': {
        _name: 'scitation',
        'pubs': [
            {
                title: 'journal',
                docs: 'https://docs.rsshub.app/journal.html#scitation',
                source: '/:pub/:jrn',
                target: '/scitation/:pub/:jrn',
            },
            {
                title: 'section',
                docs: 'https://docs.rsshub.app/journal.html#scitation',
                source: ':pub.scitation.org/toc/:jrn',
                target: (params, url) => `/scitation/:pub/:jrn/${new URL(url).searchParams.get('tocSection')}`,
            },
        ],
    },
};
