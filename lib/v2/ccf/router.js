module.exports = function (router) {
    router.get('/tfbd/:caty/:id', require('./tfbd/index'));
};
