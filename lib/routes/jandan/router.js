module.exports = function (router) {
    router.get('/:category', './section');
    router.get('/', './index');
};
