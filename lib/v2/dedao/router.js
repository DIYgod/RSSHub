module.exports = function (router) {
    router.get('/list/:category?', require('./list'));
    router.get('/knowledge/:topic?/:type?', require('./knowledge'));
    router.get('/user/:id/:type?', require('./user'));
    router.get('/:category?', require('./index'));
};
