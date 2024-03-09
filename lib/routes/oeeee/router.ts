export default (router) => {
    router.get('/web/:channel', './web');
    router.get('/app/channel/:id', './app/channel');
    router.get('/app/reporter/:id', './app/reporter');
};
