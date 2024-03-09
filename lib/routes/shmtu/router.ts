export default (router) => {
    router.get('/jwc/:type', './jwc');
    router.get('/portal/:type', './portal');
    router.get('/www/:type', './www');
};
