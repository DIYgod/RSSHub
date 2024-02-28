module.exports = (router) => {
    router.get('/recommend', './recommend');
    router.get('/topic/:id', './topic');
};
