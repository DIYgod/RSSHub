module.exports = (router) => {
    router.get('/mmda/tags/:tags?', require('./mmda'));
};
