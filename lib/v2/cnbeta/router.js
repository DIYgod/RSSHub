module.exports = function (router) {
    router.get('/:type/:id', './type');
    router.get('/', './type');
};
