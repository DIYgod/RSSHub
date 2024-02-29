module.exports = function (router) {
    router.get('/:subsite/:tag?', './subsite');
};
