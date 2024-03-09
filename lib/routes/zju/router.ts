export default (router) => {
    router.get('/career/:type', './career');
    router.get('/cst/custom/:id', './cst/custom');
    router.get('/cst/:type', './cst');
    router.get('/grs/:type', './grs');
    router.get('/list/:type', './list');
    router.get('/physics/:type', './physics');
};
