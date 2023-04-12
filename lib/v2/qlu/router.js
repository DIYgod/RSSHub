module.exports = (router) => {
    router.get('/notice', require('./notice'));
    router.get('/yjszs/:type', require('./yjszs'));
};
