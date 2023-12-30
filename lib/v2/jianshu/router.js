module.exports = (router) => {
    router.get('/collection/:id', require('./collection'));
    router.get('/home', require('./home'));
    router.get('/user/:id', require('./user'));
};
