export default (router) => {
    router.get('/*/*', './index');
    router.get('/:0?', './index');
};
