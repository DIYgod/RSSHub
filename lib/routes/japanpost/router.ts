export default (router) => {
    router.get('/track/:reqCode/:locale?', './track');
};
