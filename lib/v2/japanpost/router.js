module.exports = (router) => {
    router.get('/track/:reqCode/:locale?', require('./track'));
};
