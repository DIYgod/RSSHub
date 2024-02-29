module.exports = function (router) {
    router.get('/:region?', './rss');
};
