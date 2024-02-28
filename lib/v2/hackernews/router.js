module.exports = function (router) {
    router.get('/:section?/:type?/:user?', './index');
};
