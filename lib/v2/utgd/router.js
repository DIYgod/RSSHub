module.exports = function (router) {
    router.get('/timeline', require('./timeline'));
    router.get('/topic/:topic?', require('./topic'));
    router.get('/:category?', require('./category'));
};
