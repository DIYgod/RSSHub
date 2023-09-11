module.exports = (router) => {
    router.get('/:configId/posts', require('./posts'));
    router.get('/:configId/notifications/:fulltext?', require('./notifications'));
};
