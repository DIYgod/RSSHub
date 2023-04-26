module.exports = (router) => {
    router.get('/articles/:type/:id?', require('./index'));
};
