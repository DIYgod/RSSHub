module.exports = function (router) {
    router.get('/forum/:fid', require('./forum'));
};
