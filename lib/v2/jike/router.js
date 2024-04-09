module.exports = (router) => {
    router.get('/topic/text/:id', require('./topicText'));
    router.get('/topic/:id/:showUid?', require('./topic'));
    router.get('/user/:id', require('./user'));
};
