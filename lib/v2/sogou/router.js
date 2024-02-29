module.exports = function (router) {
    router.get('/doodles', './doodles');
    router.get('/search/:keyword', './search');
};
