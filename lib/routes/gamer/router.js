module.exports = function (router) {
    router.get('/gnn/:category?', './gnn-index');
    router.get('/hot/:bsn', './hot');
};
