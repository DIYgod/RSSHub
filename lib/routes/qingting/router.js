export default (router) => {
    router.get('/channel/:id', './channel');
    router.get('/podcast/:id', './podcast');
};
