module.exports = (router) => {
    router.get('/notice', require('./notice'));
    router.get('/yz/:type', require('./yz'));
};
