module.exports = function (router) {
    router.get('/2yuan/news/:id?', require('./2yuan/news'));
    router.get('/dean/:subpath+', require('./dean'));
    router.get('/dyyy/:path+', require('./dyyy/index'));
    router.get('/ee/:id?', require('./ee'));
    router.get('/gs/tzgg', require('./gs/tzgg'));
    router.get('/international/:subpath+', require('./international'));
    router.get('/job/:subpath?', require('./job'));
    router.get('/std/:category?', require('./std'));
};
