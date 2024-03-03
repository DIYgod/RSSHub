export default (router) => {
    router.get('/', './');
    router.get('/:id{.+}', './');
};
