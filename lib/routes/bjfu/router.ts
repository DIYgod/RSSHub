export default (router) => {
    router.get('/grs', './grs');
    router.get('/it/:type', './it/index');
    router.get('/jwc/:type', './jwc/index');
    router.get('/kjc', './kjc');
    router.get('/news/:type', './news/index');
};
