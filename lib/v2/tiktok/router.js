module.exports = (router) => {
    router.get('/user/:user', require('./user'));
};
