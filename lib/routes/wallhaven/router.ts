export default (router) => {
    router.get('/search/:filter?/:needDetails?', './index');
    router.get('/:filter?/:needDetails?', './index');
};
