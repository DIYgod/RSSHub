export default (router) => {
    router.get('/:id?', './');
    router.get('/:id/:category{.+}', './');
};
