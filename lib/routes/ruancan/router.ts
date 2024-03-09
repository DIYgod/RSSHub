export default (router) => {
    router.get('/category/:category?', './category');
    router.get('/search/:keyword?', './search');
    router.get('/user/:id', './user');
    router.get('/', './index');
};
