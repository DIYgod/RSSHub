module.exports = function (router) {
    router.get('/preferential', require('./preferential'));
    router.get('/creditcard/:bank', require('./creditcard'));
};
