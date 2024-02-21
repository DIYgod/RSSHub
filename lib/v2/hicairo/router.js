module.exports = function (router) {
    router.get('/', require('./rss'));
    router.get('/rss1', require('./rss1'));
};
