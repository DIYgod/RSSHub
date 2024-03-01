module.exports = (router) => {
    router.get('/latestMovies', require('./latest-movies'));
    router.get('/latestTVSeries', require('./latest-tvseries'));
};
