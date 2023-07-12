module.exports = (router) => {
    router.get('/today', require('./today'));
    router.get('/yjsc/:type', require('./yjsc'));
};
