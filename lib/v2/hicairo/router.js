module.exports = function (router) {
    router.get('/', require('./rss'));
    router.get('/', require('./rss1'));
};
