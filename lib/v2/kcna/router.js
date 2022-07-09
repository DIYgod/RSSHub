module.exports = function (router) {
    router.get('/:lang/:category?', require('./news'));
};
