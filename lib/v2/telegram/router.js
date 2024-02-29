const config = require('@/config').value;
const coreRouter = require('@/core-router');

module.exports = function (router) {
    if (config.telegram.session && config.feature.mediaProxyKey) {
        // core_router does not cache, which is necessary for video streaming
        coreRouter.get('/telegram/channel/:username/:key/:media(.+)', require('./tglib/channel').getMedia);
    }

    router.get('/channel/:username/:routeParams?', (ctx) => {
        // tglib impl does not support routeParams yet
        const useWeb = ctx.params.routeParams || !(config.telegram.session && config.feature.mediaProxyKey);
        return useWeb ? require('./channel')(ctx) : require('./tglib/channel')(ctx);
    });

    router.get('/stickerpack/:name', require('./stickerpack'));
    router.get('/blog', require('./blog'));
};
