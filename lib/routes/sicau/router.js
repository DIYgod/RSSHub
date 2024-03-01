export default (router) => {
    router.get('/dky/:category?', './dky');
    router.get('/yan/:category?', './yan');
    router.get('/zsjy/:category?', './zsjy');
};
