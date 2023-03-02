module.exports = function (router) {
    router.get('/price/:id', require('./price'));
};
