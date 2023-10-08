module.exports = (router) => {
    router.get('/packs/:type?', require('./beatmaps/packs'));
};
