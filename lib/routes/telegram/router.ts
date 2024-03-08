import { config } from '@/config';
import channelMedia from './tglib/channel-media';

export default (router) => {
    if (config.telegram.session) {
        router.get('/channel/:username', './tglib/channel');
        router.app.get('/channel/:username/:media', channelMedia);
    } else {
        router.get('/channel/:username/:routeParams?', './channel');
    }
    router.get('/stickerpack/:name', './stickerpack');
    router.get('/blog', './blog');
};
