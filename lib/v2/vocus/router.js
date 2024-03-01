module.exports = (router) => {
    router.get('/publication/:id', require('./publication'));
    router.get('/user/:id', require('./user'));
};
