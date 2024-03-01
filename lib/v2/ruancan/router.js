module.exports = function (router) {
    router.get('/category/:category?', require('./category'));
    router.get('/search/:keyword?', require('./search'));
    router.get('/user/:id', require('./user'));
    router.get('/', require('./index'));
};
