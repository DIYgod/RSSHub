export default (router) => {
    router.get('/exclusive/:locale?', './');
    router.get('/news/:locale?', './');
    router.get('/:locale?', './');
    router.get('/:type/:id/:locale?', './');
};
