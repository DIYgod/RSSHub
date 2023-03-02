module.exports = (router) => {
    router.get('/news/:cate?', require('./news'));
    router.get('/ddh/:cate?', require('./ddh'));
};
