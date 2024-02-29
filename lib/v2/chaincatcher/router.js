module.exports = (router) => {
    router.get('/', './home');
    router.get('/news', './news');
};
