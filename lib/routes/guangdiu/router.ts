export default (router) => {
    router.get('/rank', './rank');
    router.get('/cheaps/:query?', './cheaps');
    router.get('/search/:query?', './search');
    router.get('/:query?', './index');
};
