export default (router) => {
    router.get('/bullets', './bullets');
    router.get('/:category', './tag');
    router.get('/most-viewed/:time', './most-viewed');
    router.get('/tag/:topic', './tag');
};
