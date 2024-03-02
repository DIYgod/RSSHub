export default (router) => {
    router.get('/thread/:tid', './thread');
    router.get('/digest/:tid', './digest');
};
