module.exports = function (router) {
    router.get('/jwch/:type?', require('./jwch'));
    router.get('/yjsb/:type?', require('./yjsb'));
};
