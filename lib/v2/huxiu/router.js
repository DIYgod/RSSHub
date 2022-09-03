module.exports = (router) => {
    router.get('/article', require('./article'));
    router.get('/author/:id', require('./author'));
    router.get('/collection/:id', require('./collection'));
    router.get('/moment', require('./moment'));
    router.get('/tag/:id', require('./tag'));
    router.get('/search/:keyword', require('./search'));
    router.get('/briefcolumn/:id', require('./briefColumn'));
};
