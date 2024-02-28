module.exports = (router) => {
    router.get('/article/:category?', './article');
};
