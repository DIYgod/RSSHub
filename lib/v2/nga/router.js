module.exports = function (router) {
    router.get('/forum/:fid/:recommend?', require('./forum'));
    router.get('/post/:tid/:authorId?', require('./post'));
};
