module.exports = (router) => {
    router.get('/articles/:type', require('./index'));
};
