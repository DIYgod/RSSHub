export default (router) => {
    router.get('/scientific', './scientific');
    router.get('/:channel', './channel');
};
