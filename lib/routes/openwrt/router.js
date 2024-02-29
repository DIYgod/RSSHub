module.exports = function (router) {
    router.get('/releases/:brand/:model', './releases');
};
