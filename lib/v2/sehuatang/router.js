module.exports = function (router) {
    router.get('/subforum/bt/:subforumid?', require('./index'));
    router.get('/subforum/picture/:subforumid', require('./index'));
    router.get('/subforum/:subforumid?/:type?', require('./index'));
    router.get('/subforum/:subforumid?', require('./index'));
    router.get('/user/:uid', require('./user'));
};
