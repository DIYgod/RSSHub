module.exports = (router) => {
    router.get('/recommend', require('./recommend'));
    router.get('/topic/:id', require('./topic'));
};
