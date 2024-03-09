export default (router) => {
    router.get('/:category?/:sort?/:day?', './index');
};
