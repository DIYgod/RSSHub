module.exports = {
    'ieee.org': {
        _name: 'IEEE',
        www: [
            {
                title: 'latestVolume',
                docs: 'https://docs.rsshub.app/journal.html#ieee-xplore',
                source: '/*',
                target: (params, url) => `/ieee/${new URL(url).searchParams.get('punumber')}/latest/vol`,
            },
            {
                title: 'latestDate',
                docs: 'https://docs.rsshub.app/journal.html#ieee-xplore',
                source: '/*',
                target: (params, url) => `/ieee/${new URL(url).searchParams.get('punumber')}/latest/date`,
            },
        ],
    },
};
