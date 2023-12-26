module.exports = function (router) {
    router.get('/channel/:id', require('./channel'));
    router.get('/tag/:id', require('./tag'));
};
