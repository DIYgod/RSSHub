module.exports = (router) => {
    router.get('/user/:user/:iframe?', require('./user'));
};
