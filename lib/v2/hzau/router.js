module.exports = function (router) {
    router.get('/yjs/:type', require('./yjs'));
};
