module.exports = (router) => {
    router.get('/datahero/:category?', require('./datahero'));
    router.get('/datainsight/:id?', require('./datainsight'));
};
