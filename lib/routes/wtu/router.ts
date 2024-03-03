export default (router) => {
    router.get('/:type', './index');
    router.get('/job/:type', './job');
};
