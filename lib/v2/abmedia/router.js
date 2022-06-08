module.exports = function (router) {
    router.get('/index', require('./index'));
    router.get('/:category?', require('./category'));
};
