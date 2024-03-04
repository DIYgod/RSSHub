export default (router) => {
    router.get('/bmie/:type', './bmie');
    router.get('/news/:type', './news');
};
