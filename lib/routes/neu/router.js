module.exports = (router) => {
    router.get('/bmie/:type', './bmie');
    router.get('/news/:type', './news');
};
