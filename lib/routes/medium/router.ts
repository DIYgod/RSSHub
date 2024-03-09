export default (router) => {
    router.get('/following/:user', './following');
    router.get('/for-you/:user', './for-you');
    router.get('/list/:user/:catalogId', './list');
    router.get('/tag/:user/:tag', './tag');
};
