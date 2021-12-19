module.exports = function (router) {
    router.get('/:type?/:category?', require('./index'));
};
