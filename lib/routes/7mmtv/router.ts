export default (router) => {
    router.get('/:language?/:category?/:type?', './index');
};
