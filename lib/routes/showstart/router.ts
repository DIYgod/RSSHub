export default (router) => {
    router.get('/artist/:id', './artist');
    router.get('/brand/:id', './brand');
    router.get('/event/:cityCode/:showStyle?', './event');
    router.get('/search/:type/:keyword?', './search');
};
