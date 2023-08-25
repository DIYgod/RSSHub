module.exports = (router) => {
    router.get('/:type/:id/:all?', require('./album'));
    router.get('/:type/:id/:all/:shownote?', require('./album'));
};
