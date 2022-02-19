module.exports = function (router) {
    router.get('/topic/:topic', require('./topic'));
    router.get('/topic_list', require('./topic_list'));
    router.get('/:category?', require('./index'));
};
