module.exports = function (router) {
    router.get('/topic/:topic?', require('./topic'));
    router.get('/:category?', require('./category'));
};
