export default (router) => {
    router.get('/author/:uid/:lang?', './author');
    router.get('/:lang?', './index');
};
