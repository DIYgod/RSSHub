export default (router) => {
    router.get('/:region?/:category*', './');
};
