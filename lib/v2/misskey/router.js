module.exports = function (router) {
    router.get('/notes/featured/:site', './featured-notes');
};
