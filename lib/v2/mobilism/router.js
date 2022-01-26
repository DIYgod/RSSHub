module.exports = function (router) {
    router.get('/forums/:category/:type', require('./forums'));
    router.get('/portal/:type', require('./portal'));
};
