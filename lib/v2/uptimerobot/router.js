module.exports = (router) => {
    router.get('/rss/:id/:routeParams?', require('./rss'));
};
