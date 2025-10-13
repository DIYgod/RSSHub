module.exports = (router) => {
    router.get('/category/:category', require('./category'));
    router.get('/tag/:tag', require('./tag'));
};
