module.exports = function (router) {
    router.get('/epicgames/:collection', require('./index'));
};
