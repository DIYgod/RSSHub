module.exports = (router) => {
    router.get('/news/:category?', './news');
};
