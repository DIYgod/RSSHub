module.exports = function (router) {
    router.get('/list/:id', './list');
    router.get('/:category*', './lists');
};
