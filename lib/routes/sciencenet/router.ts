export default (router) => {
    router.get('/blog/:type?/:time?/:sort?', './blog');
    router.get('/user/:id', './user');
};
