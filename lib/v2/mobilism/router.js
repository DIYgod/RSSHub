module.exports = function (router) {
    router.get('/forums/:category/:type/:fulltext?', require('./forums'));
    router.get('/portal/:type/:fulltext?', require('./portal'));
};
