export default (router) => {
    router.get('/channel/:username/:routeParams?', './channel');
    router.get('/stickerpack/:name', './stickerpack');
    router.get('/blog', './blog');
};
