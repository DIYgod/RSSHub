module.exports = function (router) {
    router.get('/artist/:id', require('./artist'));
    router.get('/posts', require('./posts'));
};
