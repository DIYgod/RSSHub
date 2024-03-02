export default (router) => {
    router.get('/dc/:type', './dc');
    router.get('/gra/:type', './gra');
    router.get('/index/:type', './index');
    router.get('/lib/:type', './lib');
    router.get('/sxw/:type', './sxw');
};
