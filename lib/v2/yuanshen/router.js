module.exports = function (router) {
    router.get('/:location?/:category?', require('./news'));
};
