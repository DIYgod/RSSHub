module.exports = function (router) {
    router.get('/reports', require('./reports'));
    router.get('/:cate?', require('./index'));
};
