module.exports = (router) => {
    router.get('/artist/:id', require('./artist'));
    router.get('/brand/:id', require('./brand'));
    router.get('/event/:cityCode/:showStyle?', require('./event'));
    router.get('/search/:type/:keyword?', require('./search'));
};
