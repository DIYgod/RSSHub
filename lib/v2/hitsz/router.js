module.exports = (router) => {
    router.get('/article/:category?', require('./article'));
    router.get('/yzb/:type', require('./yzb'));
};
