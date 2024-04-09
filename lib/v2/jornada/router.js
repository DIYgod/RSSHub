module.exports = function (router) {
    router.get('/:date?/:category?', require('./index'));
};
