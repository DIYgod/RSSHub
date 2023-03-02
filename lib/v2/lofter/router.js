module.exports = (router) => {
    router.get('/tag/:name?/:type?', require('./tag'));
    router.get('/user/:name?', require('./user'));
};
