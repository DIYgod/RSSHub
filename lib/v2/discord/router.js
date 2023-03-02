module.exports = (router) => {
    router.get('/channel/:channelID', require('./channel'));
};
