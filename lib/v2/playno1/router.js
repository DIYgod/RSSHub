module.exports = (router) => {
    router.get('/av/:catid?', require('./av'));
    router.get('/st/:catid?', require('./st'));
};
