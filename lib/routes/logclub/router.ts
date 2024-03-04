export default (router) => {
    router.get('/lc_report/:id?', './report');
    router.get('/report/:id?', './report');
    router.get('/:category*', './');
};
