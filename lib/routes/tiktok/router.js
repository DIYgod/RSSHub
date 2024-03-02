export default (router) => {
    router.get('/user/:user/:iframe?', './user');
};
