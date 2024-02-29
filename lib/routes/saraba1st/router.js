module.exports = (router) => {
    router.get('/thread/:tid', './thread');
    router.get('/digest/:tid', './digest');
};
