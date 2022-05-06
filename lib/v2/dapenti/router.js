module.exports = function (router) {
    router.get('/tugua', require('./tugua'));
    router.get('/subject/:id', require('./subject'));
};
