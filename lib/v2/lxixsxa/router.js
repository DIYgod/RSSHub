module.exports = function (router) {
    router.get('/info', require('./information'));
    router.get('/disco', require('./discography'));
};
