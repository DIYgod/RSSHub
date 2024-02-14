module.exports = (router) => {
    router.get('/:channelId?', require('./notice'));
};
