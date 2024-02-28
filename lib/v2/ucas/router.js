module.exports = function (router) {
    router.get('/ai', './ai');
    router.get('/job/:type?', './index');
};
