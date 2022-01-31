module.exports = function (router) {
    router.get('/tag/:owner/:image', require('./tag'));
};
