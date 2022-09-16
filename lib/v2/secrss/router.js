module.exports = (router) => {
    router.get('/author/:author', require('./author'));
    router.get('/category/:category?', require('./category'));
};
