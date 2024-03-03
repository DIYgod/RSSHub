export default (router) => {
    router.get('/', './');
    router.get('/:params{.+}', './');
};
