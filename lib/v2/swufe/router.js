module.exports = function (router) {
    router.get('/jwc/:category', require('./jwc'));
    router.get('/yz/:category', require('./yz'));
    router.get('/www/:category', require('./www'));
};
