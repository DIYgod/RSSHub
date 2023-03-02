module.exports = (router) => {
    router.get('/topic/:topicId?', require('./topic'));
};
