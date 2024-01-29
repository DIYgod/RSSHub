module.exports = function (router) {
    router.get('/gnn/:category?', require('./gnn-index'));
    router.get('/hot/:bsn', require('./hot'));
};
