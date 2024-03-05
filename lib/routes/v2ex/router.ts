export default (router) => {
    router.get('/post/:postid', './post');
    router.get('/tab/:tabid', './tab');
    router.get('/topics/:type', './topics');
};
