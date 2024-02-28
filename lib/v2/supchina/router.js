module.exports = function (router) {
    router.get('/podcasts', './podcasts');
    router.get('/', './index');
};
