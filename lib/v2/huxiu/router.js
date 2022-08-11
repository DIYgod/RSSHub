module.exports = (router) => {
    router.get('/article', require('./article'));
    router.get('/author/:id', require('./author'));
    router.get('/collection/:id', require('./collection'));
    router.get('/tag/:id', require('./tag'));
    router.get('/search/:keyword', require('./search'));
};
