module.exports = function (router) {
    router.get('/devlog/:user/:id', require('./devlog'));
    router.get('/posts/:topic/:id', require('./posts'));
    router.get(/([\w\d/-]+)?/, require('./index'));
};
