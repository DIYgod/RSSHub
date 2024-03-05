export default (router) => {
    router.get('/:id?/:category*', './');
};
