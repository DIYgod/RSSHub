module.exports = (router) => {
    router.get('/', require('./index'));
    router.get('/category/:cate', require('./category'));
};
