module.exports = function (router) {
    router.get('/pen0', './pen0');
    router.get('/:category?', './index');
};
