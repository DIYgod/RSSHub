module.exports = function (router) {
    router.get('/report', './report');
    router.get('/weekly/:category?', './weekly');
};
