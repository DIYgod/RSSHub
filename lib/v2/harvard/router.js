module.exports = (router) => {
    router.get('/health/blog', require('./health/blog'));
};
