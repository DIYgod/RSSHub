module.exports = {
    'fosshub.com': {
        _name: 'FossHub',
        '.': [
            {
                title: 'Software Update',
                docs: 'https://docs.rsshub.app/routes/program-update#fosshub-software-update',
                source: ['/'],
                target: (params, url) => `/fosshub/${new URL(url).match(/\/(.*?)\.html$/)[1]}`,
            },
        ],
    },
};
