export default (router) => {
    router.get('/news/:category?', './news');
    router.get('/topic/:topic', './topic');
    router.get('/u/:uid', './user');
    router.get('/user/:id', './user');
};
