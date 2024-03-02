export default (router) => {
    router.get('/qa/:category?/:state?', './qa');
    router.get('/share/:category?', './share');
    router.get('/update', './versions');
    router.get('/user/:category/:id', './user');
    router.get('/versions', './versions');
};
