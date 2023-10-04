const config = require('@/config').value;
const core_router = require('@/core_router');
const tglibChannel = require('./tglib/channel');
const webChannel = require('./channel');

module.exports = function (router) {
    if (config.telegram.session) {
        // core_router does not cache, which is necessary for video streaming
        core_router.get('/telegram/channel/:username/:media(.+)', tglib.getMedia);
    }
    
    router.get('/channel/:username/:routeParams?', (ctx) => {
        // tglib impl does not support routeParams yet
        const useWeb = ctx.params.routeParams || !config.telegram.session;
        return useWeb ? webChannel(ctx) : tglibChannel(ctx);
    });

    router.get('/stickerpack/:name', require('./stickerpack'));
    router.get('/blog', require('./blog'));
};
