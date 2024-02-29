module.exports = function (router) {
    router.get('/career', './career');
    router.get('/cse/:type?', './cse');
    router.get('/mail/:type?', './mail');
};
