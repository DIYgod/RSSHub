export default (router) => {
    router.get('/index/:category?', './index');
    router.get('/jwc/:category?', './jwc');
    router.get('/rsc/:category?', './rsc');
};
