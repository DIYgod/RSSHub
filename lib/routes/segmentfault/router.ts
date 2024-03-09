export default (router) => {
    router.get('/blogs/:tag', './blogs');
    router.get('/channel/:name', './channel');
    router.get('/user/:name', './user');
};
