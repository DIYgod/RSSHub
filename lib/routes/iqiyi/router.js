export default (router) => {
    router.get('/album/:id', './album');
    router.get('/user/video/:uid', './video');
};
