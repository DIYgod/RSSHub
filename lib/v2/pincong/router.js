module.exports = (router) => {
    router.get('/category/:category?/:sort?', './index');
    router.get('/hot/:category?', './hot');
    router.get('/topic/:topic', './topic');
};
