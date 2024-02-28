module.exports = (router) => {
    router.get('/datahero/:category?', './datahero');
    router.get('/datainsight/:id?', './datainsight');
};
