module.exports = (router) => {
    router.get('/feng/:id/:type', require('./feng'));
    router.get(/news([\w-/]+)?/, require('./news'));
};
