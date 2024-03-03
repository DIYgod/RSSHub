export default (router) => {
    router.get('/category/:category/:staffpicks?', './category');
    router.get('/channel/:channel', './channel');
    router.get('/user/:username/:cat?', './usr-videos');
};
