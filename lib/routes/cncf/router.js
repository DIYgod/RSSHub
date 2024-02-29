module.exports = function (router) {
    router.get('/reports', './reports');
    router.get('/:cate?', './index');
};
