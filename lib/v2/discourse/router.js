module.exports = (router) => {
    router.get('/:configId/posts', require('./posts'));
};
