module.exports = (router) => {
    router.get('/recently/:category?', require('./recently'));
};
