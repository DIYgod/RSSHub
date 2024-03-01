export default (router) => {
    router.get('/live/:login', './live');
    router.get('/video/:login/:filter?', './video');
    router.get('/schedule/:login', './schedule');
};
