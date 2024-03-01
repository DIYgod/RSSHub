export default (router) => {
    router.get('/cic/:type?', './cic');
    router.get('/news/:type?', './news');
    router.get('/oaa/:type?', './oaa');
    router.get('/yzb/:type?', './yzb');
};
