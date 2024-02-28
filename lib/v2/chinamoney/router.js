module.exports = (router) => {
    router.get('/:channelId?', './notice');
};
