module.exports = (router) => {
    router.get('/news/:cate?', './news');
};
