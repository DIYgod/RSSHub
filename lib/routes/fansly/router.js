module.exports = (router) => {
    router.get('/tag/:tag', './tag');
    router.get('/user/:username', './post');
};
