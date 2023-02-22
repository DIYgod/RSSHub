module.exports = (router) => {
    router.get('/:topicPath*', require('./index'));
};
