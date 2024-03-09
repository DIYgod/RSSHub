export default (router) => {
    router.get('/channel/:channelId/:embed?', './channel');
};
