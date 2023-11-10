module.exports = function (router) {
    router.get('/posts', require('./posts'));
    router.get('/tag/:tag?', require('./tag'));
};
