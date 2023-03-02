module.exports = function (router) {
    router.get('/master/:type', require('./master/masterinfo'));
};
