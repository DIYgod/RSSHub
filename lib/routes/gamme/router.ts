export default (router) => {
    router.get('/:domain/:category?', './category');
    router.get('/:domain/tag/:tag', './tag');
};
