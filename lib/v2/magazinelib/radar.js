module.exports = {
    'magazinelib.com': {
        _name: 'Magazine',
        '.': [
            {
                title: 'Latest Magazine',
                docs: 'https://docs.rsshub.app/shopping.html#arcteryx',
                source: ['/', '/?s=*'],
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
