module.exports = (router) => {
    router.get('/track/:reqCode/:locale?', './track');
};
