module.exports = (router) => {
    router.get('/news/:cate?', require('./news'));
};
