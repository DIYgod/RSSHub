module.exports = function (router) {
    router.get('/:category?/:type?/:is_history?', require('./index'));
};
