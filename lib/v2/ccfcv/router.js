module.exports = function (router) {
    router.get('/:channel/:category', require('./index'));
};
