module.exports = {
    'magazinelib.com': {
        _name: 'magazineLib',
        '.': [
            {
                title: 'Latest Magazine',
                docs: 'https://docs.rsshub.app/reading.html#magazinelib',
                source: ['/'],
                target: (_, url) => {
                    const query = new URL(url).searchParams.get('s');
                    if (query === null) {
                        return '/magazinelib/latest-magazine';
                    }
                    return `/magazinelib/latest-magazine/${query}`;
                },
            },
        ],
    },
};
