export default (router) => {
    router.get('/gfxy/:category?/:page?', './gfxy');
    router.get('/ied/:type?/:category?/:page?', './ied');
    router.get('/jwc/:category?/:page?', './jwc');
    router.get('/xky/:category?/:page?', './xky');
};
