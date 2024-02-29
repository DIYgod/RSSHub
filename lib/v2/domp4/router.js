module.exports = function (router) {
    router.get('/detail/:id', './detail');
    router.get('/latest/:type?', './latest');
};
