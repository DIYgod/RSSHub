module.exports = (router) => {
    router.get('/event/:cityCode/:showStyle?', require('./event'));
    router.get('/search/:type/:keyword?', require('./search'));
    router.get('/artist/:id', require('./artist'));
    router.get('/brand/:id', require('./brand'));
};
