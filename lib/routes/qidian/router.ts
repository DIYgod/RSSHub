export default (router) => {
    router.get('/author/:id', './author');
    router.get('/chapter/:id', './chapter');
    router.get('/forum/:id', './forum');
    router.get('/free/:type?', './free');
    router.get('/free-next/:type?', './free-next');
};
