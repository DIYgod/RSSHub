module.exports = function (router) {
    router.get('/latest-magazine/:query?', './latest-magazine');
};
