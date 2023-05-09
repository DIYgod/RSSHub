module.exports = (router) => {
    router.get('/grs/:type', require('./grs'));
};
