module.exports = function (router) {
    router.get('/blogs/:locale?', require('./index'));
};
