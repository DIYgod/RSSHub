module.exports = {
    'ieee.org': {
        _name: 'IEEE',
        www: [
            {
                title: 'Journal',
                docs: 'https://docs.rsshub.app/journal.html#ieee-xplore',
                source: '/*',
                target: (params, url) => `/ieee/journal/${new URL(url).searchParams.get('punumber')}`,
            },
            {
                title: 'Recent',
                docs: 'https://docs.rsshub.app/journal.html#ieee-xplore',
                source: '/*',
                target: (params, url) => `/ieee/journal/${new URL(url).searchParams.get('punumber')}/recent`,
            },
            {
                title: 'Early Access Journal',
                docs: 'https://docs.rsshub.app/journal.html#ieee-xplore',
                source: '/*',
                target: (params, url) => `/ieee/journal/${new URL(url).searchParams.get('isnumber')}/earlyaccess`,
            },
        ],
    },
};
