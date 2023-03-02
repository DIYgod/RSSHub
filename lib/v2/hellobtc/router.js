module.exports = function (router) {
    router.get('/information/:channel?', require('./information'));
    router.get('/news', require('./news'));
    router.get('/kepu/:channel?', require('./kepu'));
    router.get('/topic/:id', require('./topic'));
};
