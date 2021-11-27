module.exports = function (router) {
    router.get('/:category?/:sort?', require('./index'));
};
