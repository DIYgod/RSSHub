module.exports = function (router) {
    router.get('/job/:type?', require('./index'));
};
