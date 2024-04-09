module.exports = (router) => {
    router.get('/topic/:category?', require('./topic'));
};
