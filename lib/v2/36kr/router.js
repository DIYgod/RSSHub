module.exports = (router) => {
    router.get('/hot-list/:category?', './hot-list');
    router.get('*', './index');
};
