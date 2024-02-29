module.exports = (router) => {
    router.get('/', './index');
    router.get('/:topic', './topic');
};
