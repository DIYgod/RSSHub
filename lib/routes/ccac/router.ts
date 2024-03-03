export default (router) => {
    router.get('/news/:type/:lang?', './news');
};
