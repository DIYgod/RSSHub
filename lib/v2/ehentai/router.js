module.exports = (router) => {
    router.get('/favorites/:favcat?/:order?/:page?/:routeParams?', require('./favorites'));
    router.get('/search/:params?/:page?/:routeParams?', require('./search'));
    router.get('/tag/:tag/:page?/:routeParams?', require('./tag'));
};
