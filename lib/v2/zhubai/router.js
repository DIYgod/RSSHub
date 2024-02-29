module.exports = function (router) {
    router.get('/top20', './top20');
    router.get('/:id', './index');
};
