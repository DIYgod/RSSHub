module.exports = function (router) {
    router.get('/:category?/:sort?/:day?', require('./index'));
};
