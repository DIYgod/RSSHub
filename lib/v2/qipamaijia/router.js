module.exports = function (router) {
    router.get('/:cate?', require('./index'));
};
