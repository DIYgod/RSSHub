module.exports = function (router) {
    router.get('/:category?/:id?', require('./'));
};
