export default (router) => {
    router.get('/topic/text/:id', './topic-text');
    router.get('/topic/:id/:showUid?', './topic');
    router.get('/user/:id', './user');
};
