module.exports = {
    'aip.org': {
        _name: 'Scitation',
        pubs: [
            {
                title: 'Journal',
                docs: 'https://docs.rsshub.app/routes/journal#scitation',
                source: '/:pub/:jrn',
                target: '/scitation/:pub/:jrn',
            },
            {
                title: 'Section',
                docs: 'https://docs.rsshub.app/routes/journal#scitation',
                source: ':pub.scitation.org/toc/:jrn',
                target: (params, url) => `/scitation/:pub/:jrn/${new URL(url).searchParams.get('tocSection')}`,
            },
        ],
    },
};
