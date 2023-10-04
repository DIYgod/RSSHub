const config = require('@/config').value;
const core_router = require('@/core_router');
const tglib = require('./tglib/channel');

module.exports = function (router) {
    if(config.tg.session){
        // core_router does not cache, which is necessary for video streaming
        core_router.get('/telegram/channel/:channel/:media(.+)', getMedia);
        router.get('/channel/:channel', tglib);
    }else{
        router.get('/channel/:username/:routeParams?', require('./channel'));
    }

    router.get('/stickerpack/:name', require('./stickerpack'));
    router.get('/blog', require('./blog'));
};
