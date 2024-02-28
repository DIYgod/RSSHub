module.exports = function (router) {
    router.get('/preferential', './preferential');
    router.get('/creditcard/:bank', './creditcard');
};
