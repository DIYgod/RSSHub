module.exports = (router) => {
    router.get('/', require('./category'));
    router.get('/category/:category', require('./category'));
    router.get('/tag/:tag', require('./tag'));
    router.get('/topic/:topic', require('./topic'));
};
