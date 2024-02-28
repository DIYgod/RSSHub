module.exports = (router) => {
    router.get('/project/:id/versions/:routeParams?', './versions');
};
