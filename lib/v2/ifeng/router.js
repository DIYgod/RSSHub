module.exports = (router) => {
    router.get('/feng/:id/:type', require('./feng'));
};
