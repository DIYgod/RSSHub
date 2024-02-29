module.exports = function (router) {
    router.get('/jlpt', './jlpt');
    router.get('/:type?', './index');
};
