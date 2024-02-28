module.exports = (router) => {
    router.get('/:category', './category');
    router.get('/topic/:topic', './category');
};
