module.exports = function (router) {
    router.get('/dean/:subpath+', require('./dean'));
    router.get('/ee/:id?', require('./ee'));
    router.get('/gs/tzgg', require('./gs/tzgg'));
    router.get('/international/:subpath+', require('./international'));
    router.get('/job/:subpath?', require('./job'));
    router.get('/std/:category?', require('./std'));
};
