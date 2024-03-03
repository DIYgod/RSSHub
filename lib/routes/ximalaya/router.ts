export default (router) => {
    router.get('/:type/:id/:all?', './album');
    router.get('/:type/:id/:all/:shownote?', './album');
};
