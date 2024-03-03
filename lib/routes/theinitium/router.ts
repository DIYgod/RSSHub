export default (router) => {
    router.get('/:model?/:type?/:language?', './full');
};
