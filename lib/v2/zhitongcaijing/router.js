module.exports = function (router) {
    router.get('/:id?/:category?', require('./index'));
};
