module.exports = function (router) {
    router.get('/channel/:username/:searchQuery?', require('./channel'));
    router.get('/stickerpack/:name', require('./stickerpack'));
    router.get('/blog', require('./blog'));
};
