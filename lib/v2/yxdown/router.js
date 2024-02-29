module.exports = (router) => {
    router.get('/news/:category?', './news');
    router.get('/recommend', './recommend');
};
