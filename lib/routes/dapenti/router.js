module.exports = function (router) {
    router.get('/tugua', './tugua');
    router.get('/subject/:id', './subject');
};
