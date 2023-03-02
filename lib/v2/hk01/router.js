module.exports = function (router) {
    router.get('/channel/:id?', require('./channel'));
    router.get('/hot', require('./hot'));
    router.get('/issue/:id?', require('./issue'));
    router.get('/tag/:id?', require('./tag'));
    router.get('/zone/:id?', require('./zone'));
};
