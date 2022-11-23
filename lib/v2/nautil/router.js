module.exports = (router) => {
    router.get('/topic/:tid', require('./topics'));
};
