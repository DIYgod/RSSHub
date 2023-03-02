module.exports = function (router) {
    router.get('/category/:id?', require('./category'));
    router.get('/gzh/:name', require('./gzh'));
};
