module.exports = {
    'metacritic.com': {
        _name: 'Metacritic',
        '.': [
            {
                title: 'Games',
                docs: 'https://docs.rsshub.app/routes/new-media#metacritic-games',
                source: ['/browse/game/:params*'],
                target: (params, url) => {
                    url = new URL(url);
                    const sort = params.params.split(/\//).pop();
                    const filter = url.searchParams.toString();

                    return `/metacritic/game${sort ? `/${sort}${filter ? `/${filter}` : ''}` : ''}`;
                },
            },
            {
                title: 'Movies',
                docs: 'https://docs.rsshub.app/routes/new-media#metacritic-movies',
                source: ['/browse/movie/:params*'],
                target: (params, url) => {
                    url = new URL(url);
                    const sort = params.params.split(/\//).pop();
                    const filter = url.searchParams.toString();

                    return `/metacritic/movie${sort ? `/${sort}${filter ? `/${filter}` : ''}` : ''}`;
                },
            },
            {
                title: 'TV Shows',
                docs: 'https://docs.rsshub.app/routes/new-media#metacritic-tv-shows',
                source: ['/browse/tv/:params*'],
                target: (params, url) => {
                    url = new URL(url);
                    const sort = params.params.split(/\//).pop();
                    const filter = url.searchParams.toString();

                    return `/metacritic/tv${sort ? `/${sort}${filter ? `/${filter}` : ''}` : ''}`;
                },
            },
        ],
    },
};
