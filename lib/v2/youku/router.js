module.exports = function (router) {
    router.get('/channel/:channelId/:embed?', require('./channel'));
};
