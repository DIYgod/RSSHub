export default (router) => {
    router.get('/feng/:id/:type', './feng');
    router.get('/news/*', './news');
};
