module.exports = function (router) {
    router.get('/:type?', './slowmist');
};
