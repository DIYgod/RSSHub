module.exports = function (router) {
    router.get('/tag/:id?', require('./tag'));
    router.get('/date/:date?', require('./date'));
    router.get('/:category?', require('./index'));
};
