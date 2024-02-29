module.exports = function (router) {
    router.get('/master/:type', './master/masterinfo');
};
