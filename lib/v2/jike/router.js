module.exports = (router) => {
    router.get('/topic/text/:id', require('./topic-text'));
    router.get('/topic/:id/:showUid?', require('./topic'));
    router.get('/user/:id', require('./user'));
};
