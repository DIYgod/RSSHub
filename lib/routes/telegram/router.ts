import { config } from '@/config';

export default (router) => {
    if (config.telegram.session) {
        router.get('/channel/:username', './tglib/channel');
        import('./tglib/channel-media').then((channelMedia) =>
            router.app.get('/channel/:username/:media', channelMedia.default));
    } else {
        router.get('/channel/:username/:routeParams?', './channel');
    }
    router.get('/stickerpack/:name', './stickerpack');
    router.get('/blog', './blog');
};
