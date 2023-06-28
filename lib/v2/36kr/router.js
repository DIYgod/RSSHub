module.exports = (router) => {
    router.get('/hot-list/:category?', require('./hot-list'));
    router.get(/([\w-/]+)?/, require('./index'));
};
