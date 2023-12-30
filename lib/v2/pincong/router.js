module.exports = (router) => {
    router.get('/category/:category?/:sort?', require('./index'));
    router.get('/hot/:category?', require('./hot'));
    router.get('/topic/:topic', require('./topic'));
};
