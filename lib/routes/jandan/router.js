export default (router) => {
    router.get('/:category', './section');
    router.get('/', './index');
};
