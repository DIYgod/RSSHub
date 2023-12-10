module.exports = (router) => {
    router.get('/yz/:type?', require('./yz'));
};
