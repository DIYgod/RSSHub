module.exports = {
    'themoviedb.org': {
        _name: 'TMDB',
        '.': [
            {
                title: 'Collection',
                docs: 'https://docs.rsshub.app/multimedia.html#tmdb',
                source: ['/collection/:name'],
                target: (params) => `/tmdb/collection/${params.name.split('-')[0]}`,
            },
            {
                title: 'Popular Movies',
                docs: 'https://docs.rsshub.app/multimedia.html#tmdb',
                source: ['/movie'],
                target: '/tmdb/trending/movie/week',
            },
            {
                title: 'Popular TV Shows',
                docs: 'https://docs.rsshub.app/multimedia.html#tmdb',
                source: ['/tv'],
                target: '/tmdb/trending/tv/week',
            },
            {
                title: 'TV Show Seasons',
                docs: 'https://docs.rsshub.app/multimedia.html#tmdb',
                source: ['/tv/:id/seasons'],
                target: '/tmdb/tv/:id/seasons',
            },
            {
                title: 'TV Show Episodes',
                docs: 'https://docs.rsshub.app/multimedia.html#tmdb',
                source: ['/tv/:id/season/:seasonNumber'],
                target: '/tmdb/tv/:id/seasons/:seasonNumber/episodes',
            },
            {
                title: 'TV Shows Airing Today',
                docs: 'https://docs.rsshub.app/multimedia.html#tmdb',
                source: ['/tv/airing-today'],
                target: '/tmdb/tv/airing-today',
            },
            {
                title: 'Currently Airing TV Shows',
                docs: 'https://docs.rsshub.app/multimedia.html#tmdb',
                source: ['/tv/on-the-air'],
                target: '/tmdb/tv/on-the-air',
            },
            {
                title: 'Top Rated TV Shows',
                docs: 'https://docs.rsshub.app/multimedia.html#tmdb',
                source: ['/tv/top-rated'],
                target: '/tmdb/tv/top-rated',
            },
            {
                title: 'Now Playing Movies',
                docs: 'https://docs.rsshub.app/multimedia.html#tmdb',
                source: ['/movie/now-playing'],
                target: '/tmdb/movie/now-playing',
            },
            {
                title: 'Upcoming Movies',
                docs: 'https://docs.rsshub.app/multimedia.html#tmdb',
                source: ['/movie/upcoming'],
                target: '/tmdb/movie/upcoming',
            },
            {
                title: 'Top Rated Movies',
                docs: 'https://docs.rsshub.app/multimedia.html#tmdb',
                source: ['/movie/top-rated'],
                target: '/tmdb/movie/top-rated',
            },
        ],
    },
};
