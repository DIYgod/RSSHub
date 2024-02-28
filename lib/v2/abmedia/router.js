module.exports = function (router) {
    router.get('/index', './index');
    router.get('/:category?', './category');
};
