module.exports = function (router) {
    router.get('/nga/forum/:fid/:recommend?', require('./forum'));
    router.get('/nga/post/:tid/:authorId?', require('./post'));
};
