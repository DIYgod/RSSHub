export default (router) => {
    router.get('/article', './channel');
    router.get('/author/:id/:type?', './member');
    router.get('/briefcolumn/:id', './brief-column');
    router.get('/channel/:id?', './channel');
    router.get('/club/:id', './club');
    router.get('/collection/:id', './collection');
    router.get('/member/:id/:type?', './member');
    router.get('/moment', './moment');
    router.get('/search/:keyword', './search');
    router.get('/tag/:id', './tag');
};
