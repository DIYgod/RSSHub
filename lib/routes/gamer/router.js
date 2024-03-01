export default (router) => {
    router.get('/gnn/:category?', './gnn-index');
    router.get('/hot/:bsn', './hot');
};
