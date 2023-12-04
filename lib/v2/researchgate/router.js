module.exports = (router) => {
    router.get('/publications/:id', require('./publications'));
};
