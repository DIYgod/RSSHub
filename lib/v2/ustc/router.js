module.exports = function (router) {
    router.get('/news/:type?', require('./index'));
    router.get('/jwc/:type?', require('./jwc'));
    router.get('/job/:category?', require('./job'));
};
