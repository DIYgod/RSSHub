export default (router) => {
    router.get('/collection/:id', './collection');
    router.get('/home', './home');
    router.get('/user/:id', './user');
};
