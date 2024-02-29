module.exports = (router) => {
    router.get('/packs/:type?', './beatmaps/packs');
};
