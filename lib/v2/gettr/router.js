module.exports = (router) => {
    router.get('/user/:id', require('./user'));
};
