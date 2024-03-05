export default (router) => {
    router.get('/company', './supported-company');
    router.get('/track/:number/:id/:phone?', './index');
};
