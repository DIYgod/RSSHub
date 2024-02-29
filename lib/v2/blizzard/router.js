module.exports = (router) => {
    router.get('/news/:language?/:category?', './news');
};
