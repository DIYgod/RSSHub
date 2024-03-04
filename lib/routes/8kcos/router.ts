export default (router) => {
    router.get('/', './latest');
    router.get('/cat/:cat*', './cat');
    router.get('/tag/:tag', './tag');
};
