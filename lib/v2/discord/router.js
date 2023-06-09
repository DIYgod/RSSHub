module.exports = (router) => {
    router.get('/channel/:channelId', require('./channel'));
};
