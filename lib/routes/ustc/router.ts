export default (router) => {
    router.get('/eeis/:type?', './eeis');
    router.get('/gs/:type?', './gs');
    router.get('/job/:category?', './job');
    router.get('/jwc/:type?', './jwc');
    router.get('/news/:type?', './index');
    router.get('/sist/:type?', './sist');
};
