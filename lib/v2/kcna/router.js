module.exports = function (router) {
    router.get('/:lang/:category?', './news');
};
