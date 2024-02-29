module.exports = function (router) {
    router.get('/:category?/:keyword?', './index');
};
