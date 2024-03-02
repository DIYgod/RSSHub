export default (router) => {
    router.get('/', './index');
    router.get('/:topic', './topic');
};
