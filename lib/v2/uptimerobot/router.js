module.exports = (router) => {
    router.get('/rss/:id/:routeParams?', './rss');
};
