module.exports = (router) => {
    router.get('/cmdp/image/:id*', require('./cmdp'));
};
