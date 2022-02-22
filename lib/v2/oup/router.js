module.exports = function (router) {
    router.get('/journals/:name', require('./index'));
};
