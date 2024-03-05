export default (router) => {
    router.get('/actors/:id/:filter?', './actors');
    router.get('/home/:category?/:sort?/:filter?', './index');
    router.get('/lists/:id/:filter?/:sort?', './lists');
    router.get('/makers/:id/:filter?', './makers');
    router.get('/rankings/:category?/:time?', './rankings');
    router.get('/search/:keyword?/:filter?/:sort?', './search');
    router.get('/series/:id/:filter?', './series');
    router.get('/tags/:query?/:category?', './tags');
    router.get('/:category?/:sort?/:filter?', './index');
};
