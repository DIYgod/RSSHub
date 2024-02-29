module.exports = function (router) {
    router.get('/channel/:channelId/:embed?', './channel');
};
