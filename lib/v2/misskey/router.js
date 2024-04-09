module.exports = function (router) {
    router.get('/notes/featured/:site', require('./featured-notes'));
};
