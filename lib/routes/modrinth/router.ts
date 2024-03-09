export default (router) => {
    router.get('/project/:id/versions/:routeParams?', './versions');
};
