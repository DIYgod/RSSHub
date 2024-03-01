export default (router) => {
    router.get('/:configId/posts', './posts');
    router.get('/:configId/notifications/:fulltext?', './notifications');
};
