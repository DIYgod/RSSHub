module.exports = {
    'ieee.org': {
        _name: 'IEEE',
        www: [
            {
                title: 'current',
                docs: 'https://docs.rsshub.app/journal.html#Ieee',
                source: '/*',
                target: (params, url) => `/ieee/${new URL(url).searchParams.get('punumber')}/vol-only-seq/latest/`,
            },
        ],
    },
};
