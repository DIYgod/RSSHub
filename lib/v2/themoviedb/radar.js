module.exports = {
    'themoviedb.org': {
        _name: 'The Movie Database',
        '.': [
            {
                title: 'Collection',
                docs: 'https://docs.rsshub.app/multimedia.html#the-movie-database',
                source: ['/collection/:name'],
                target: (params) => `/themoviedb/collection/${params.name.split('-')[0]}`,
            },
            {
                title: 'Popular Movies',
                docs: 'https://docs.rsshub.app/multimedia.html#the-movie-database',
                source: ['/movie'],
                target: '/themoviedb/trending/movie/week',
            },
            {
                title: 'Popular TV Shows',
                docs: 'https://docs.rsshub.app/multimedia.html#the-movie-database',
                source: ['/tv'],
                target: '/themoviedb/trending/tv/week',
            },
            {
                title: 'TV Show Seasons',
                docs: 'https://docs.rsshub.app/multimedia.html#the-movie-database',
                source: ['/tv/:id/seasons', '/tv/:id'],
                target: (params) => `/themoviedb/tv/${params.id.split('-')[0]}/seasons`,
            },
            {
                title: 'TV Show Episodes',
                docs: 'https://docs.rsshub.app/multimedia.html#the-movie-database',
                source: ['/tv/:id/season/:seasonNumber'],
                target: (params) => `/themoviedb/tv/${params.id.split('-')[0]}/seasons/${params.seasonNumber}/episodes`,
            },
            {
                title: 'TV Shows Airing Today',
                docs: 'https://docs.rsshub.app/multimedia.html#the-movie-database',
                source: ['/tv/airing-today'],
                target: '/themoviedb/tv/airing-today',
            },
            {
                title: 'Currently Airing TV Shows',
                docs: 'https://docs.rsshub.app/multimedia.html#the-movie-database',
                source: ['/tv/on-the-air'],
                target: '/themoviedb/tv/on-the-air',
            },
            {
                title: 'Top Rated TV Shows',
                docs: 'https://docs.rsshub.app/multimedia.html#the-movie-database',
                source: ['/tv/top-rated'],
                target: '/themoviedb/tv/top-rated',
            },
            {
                title: 'Now Playing Movies',
                docs: 'https://docs.rsshub.app/multimedia.html#the-movie-database',
                source: ['/movie/now-playing'],
                target: '/themoviedb/movie/now-playing',
            },
            {
                title: 'Upcoming Movies',
                docs: 'https://docs.rsshub.app/multimedia.html#the-movie-database',
                source: ['/movie/upcoming'],
                target: '/themoviedb/movie/upcoming',
            },
            {
                title: 'Top Rated Movies',
                docs: 'https://docs.rsshub.app/multimedia.html#the-movie-database',
                source: ['/movie/top-rated'],
                target: '/themoviedb/movie/top-rated',
            },
        ],
    },
};
