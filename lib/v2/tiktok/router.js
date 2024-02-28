module.exports = (router) => {
    router.get('/user/:user/:iframe?', './user');
};
