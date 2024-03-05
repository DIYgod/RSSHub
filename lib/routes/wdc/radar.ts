export default {
    'wdc.com': {
        _name: '',
        support: [
            {
                title: 'Western Digital',
                docs: 'https://docs.rsshub.app/routes/program-update#western-digital-download',
                source: ['/downloads.aspx', '/'],
                target: (params, url) => `/wdc/download/${new URL(url).searchParams.get('p')}`,
            },
        ],
    },
};
