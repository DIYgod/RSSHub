module.exports = (router) => {
    router.get('/:category', require('./category'));
    router.get('/topic/:topic', require('./category'));
};
