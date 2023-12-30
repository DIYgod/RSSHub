module.exports = (router) => {
    router.get('/category/:category?', require('./category'));
};
