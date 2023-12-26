module.exports = function (router) {
    router.get('/channel/:channel', require('./channel'));
    router.get('/tag/:tag', require('./tag'));
};
