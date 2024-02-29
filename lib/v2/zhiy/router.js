module.exports = (router) => {
    router.get('/letters/:author', './letter');
    router.get('/posts/:author', './post');
};
