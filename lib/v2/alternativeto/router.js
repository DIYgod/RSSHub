module.exports = (router) => {
    router.get('/software/:name/:routeParams?', require('./software'));
    router.get('/platform/:name/:routeParams?', require('./platform'));
};
