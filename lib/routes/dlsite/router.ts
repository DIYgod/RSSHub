export default (router) => {
    router.get('/campaign/:type/:free?', './campaign');
    router.get('/ci-en/:id/article', './ci-en/article');
    router.get('/new/:type', './new');
    router.get('*', './');
};
