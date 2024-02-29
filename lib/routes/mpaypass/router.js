module.exports = (router) => {
    router.get('/main/:type?', './main');
    router.get('/news', './news');
};
