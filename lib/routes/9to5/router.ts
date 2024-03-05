export default (router) => {
    router.get('/:subsite/:tag?', './subsite');
};
