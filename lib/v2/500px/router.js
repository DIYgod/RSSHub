module.exports = (router) => {
    router.get('/tribe/set/:id', require('./tribe-set'));
    router.get('/user/works/:id', require('./user'));
};
