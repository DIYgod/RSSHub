export default (router) => {
    router.get('/', './index');
    router.get('/:filter{.+}', './index');
};
