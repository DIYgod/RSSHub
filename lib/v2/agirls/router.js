module.exports = (router) => {
    router.get('/topic/:topic', require('./topic'));
    router.get('/topic_list', require('./topic-list'));
    router.get('/:category?', require('./index'));
};
