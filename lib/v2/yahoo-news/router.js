module.exports = function (router) {
    router.get('/:region/:category?', require('./index'));
};
