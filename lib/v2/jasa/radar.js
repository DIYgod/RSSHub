module.exports = {
    'scitation.org': {
        _name: 'JASA',
        asa: [
            {
                title: 'latest',
                docs: 'https://docs.rsshub.app/journal.html#jasa',
                source: '/*',
                target: '/jasa/latest',
            },
            {
                title: 'section',
                docs: 'https://docs.rsshub.app/journal.html#jasa',
                source: '/*',
                target: (params, url) => `/jasa/section/${new URL(url).searchParams.get('tocSection')}`,
            },
        ],
    },
};
