module.exports = function (router) {
    router.get('/qa/:category?/:state?', require('./qa'));
    router.get('/share/:category?', require('./share'));
    router.get('/update', require('./versions'));
    router.get('/user/:category/:id', require('./user'));
    router.get('/versions', require('./versions'));
};
