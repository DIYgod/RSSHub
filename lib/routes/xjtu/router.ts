export default (router) => {
    router.get('/2yuan/news/:id?', './2yuan/news');
    router.get('/dean/:subpath+', './dean');
    router.get('/dyyy/:path+', './dyyy/index');
    router.get('/ee/:id?', './ee');
    router.get('/gs/tzgg', './gs/tzgg');
    router.get('/international/:subpath+', './international');
    router.get('/job/:subpath?', './job');
    router.get('/std/:category?', './std');
};
