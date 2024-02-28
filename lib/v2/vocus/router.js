module.exports = (router) => {
    router.get('/publication/:id', './publication');
    router.get('/user/:id', './user');
};
