module.exports = function (router) {
    router.get('/zone/:id', require('./zone'));
    router.get('/channel/:id', require('./channel'));
    router.get('/issue/:id', require('./issue'));
    router.get('/tag/:id', require('./tag'));
    router.get('/hot', require('./hot'));
};
