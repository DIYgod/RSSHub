module.exports = {
    'wdc.com': {
        _name: '',
        support: [
            {
                title: 'Western Digital',
                docs: 'https://docs.rsshub.app/program-update.html#western-digital-download',
                source: ['/downloads.aspx', '/'],
                target: (params, url) => `/wdc/download/${new URL(url).searchParams.get('p')}`,
            },
        ],
    },
};
