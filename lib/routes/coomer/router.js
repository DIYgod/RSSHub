module.exports = function (router) {
    router.get('/artist/:id', './artist');
    router.get('/posts', './posts');
};
