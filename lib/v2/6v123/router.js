module.exports = (router) => {
    router.get('/latestMovies', require('./latestMovies'));
    router.get('/latestTVSeries', require('./latestTVSeries'));
};
