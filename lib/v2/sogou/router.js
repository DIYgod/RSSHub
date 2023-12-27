module.exports = function (router) {
    router.get('/doodles', require('./doodles'));
    router.get('/search/:keyword', require('./search'));
};
