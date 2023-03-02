module.exports = function (router) {
    router.get('/gnn/:category?', require('./gnn_index'));
    router.get('/hot/:bsn', require('./hot'));
};
