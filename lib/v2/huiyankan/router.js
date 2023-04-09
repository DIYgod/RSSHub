module.exports = function (router) {
    router.get('/:category?/:subcategory?', require('./index'));
};
