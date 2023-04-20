module.exports = function (router) {
    router.get('/ai', require('./ai'));
    router.get('/job/:type?', require('./index'));
};
