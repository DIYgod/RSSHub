module.exports = (router) => {
    router.get('/fund/:id?', require('./fund'));
};
