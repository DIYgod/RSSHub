module.exports = function (router) {
    router.get('/forum/:fid/:recommend?', './forum');
    router.get('/post/:tid/:authorId?', './post');
};
