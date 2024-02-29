module.exports = function (router) {
    router.get('/home', './home');
    router.get('/old_home', './old-home');
    router.get('/user/:id?', './user');
    router.get('/tag/:tagId?', './tag');
};
