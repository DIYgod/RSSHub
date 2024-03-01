module.exports = function (router) {
    router.get('/releases/:brand/:model', require('./releases'));
};
