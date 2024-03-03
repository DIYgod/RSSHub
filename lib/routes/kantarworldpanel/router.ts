export default (router) => {
    router.get('/:region?', './');
    router.get('/:region/:category{.+}', './');
};
