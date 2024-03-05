export default (router) => {
    router.get('/artist/:id', './artist');
    router.get('/posts', './posts');
};
