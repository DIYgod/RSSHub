module.exports = function (router) {
    router.get('/home', require('./home'));
    router.get('/old_home', require('./old_home'));
    router.get('/user/:id?', require('./user'));
    router.get('/tag/:tagId?', require('./tag'));
};
