export default (router) => {
    router.get('/datahero/:category?', './datahero');
    router.get('/datainsight/:id?', './datainsight');
};
