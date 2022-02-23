module.exports = function (router) {
    router.get('/:region?', require('./rss'));
};
