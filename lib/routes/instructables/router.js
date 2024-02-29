module.exports = (router) => {
    router.get('/projects/:category?', './projects');
};
