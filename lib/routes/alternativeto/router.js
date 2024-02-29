module.exports = (router) => {
    router.get('/software/:name/:routeParams?', './software');
    router.get('/platform/:name/:routeParams?', './platform');
};
