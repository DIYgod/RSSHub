module.exports = function (router) {
    router.get('/banner', require('./banner'));
    router.get('/news/:caty?', require('./news'));
    router.get('/newsflash', require('./newsflash'));
};
