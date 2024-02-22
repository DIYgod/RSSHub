module.exports = (router) => {
    router.get('/article', require('./channel'));
    router.get('/author/:id/:type?', require('./member'));
    router.get('/briefcolumn/:id', require('./brief-column'));
    router.get('/channel/:id?', require('./channel'));
    router.get('/club/:id', require('./club'));
    router.get('/collection/:id', require('./collection'));
    router.get('/member/:id/:type?', require('./member'));
    router.get('/moment', require('./moment'));
    router.get('/search/:keyword', require('./search'));
    router.get('/tag/:id', require('./tag'));
};
