module.exports = function (router) {
    router.get('/forum/:fid', require('./forum'));
    router.get('/rank/:type', require('./rank'));
};
