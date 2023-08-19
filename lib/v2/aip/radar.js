module.exports = {
    'aip.org': {
        _name: 'AIP',
        pubs: [
            {
                title: 'Journal',
                docs: 'https://docs.rsshub.app/routes/journal#AIP',
                source: '/:pub/:jrn',
                target: '/aip/:pub/:jrn',
            },
        ],
    },
};
