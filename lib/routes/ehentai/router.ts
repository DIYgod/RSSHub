export default (router) => {
    router.get('/favorites/:favcat?/:order?/:page?/:routeParams?', './favorites');
    router.get('/search/:params?/:page?/:routeParams?', './search');
    router.get('/tag/:tag/:page?/:routeParams?', './tag');
};
