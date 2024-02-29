module.exports = function (router) {
    router.get('/*/*', './index');
    router.get('/:0?', './index');
};
