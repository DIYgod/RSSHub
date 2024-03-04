export default (router) => {
    router.get('/article/:sort?/:id?', './index');
    router.get('/month', './volume');
    router.get('/ranking/:type?', './report');
    router.get('/report/:type?', './report');
    router.get('/volume', './volume');
    router.get('/:sort?/:id?', './index');
};
