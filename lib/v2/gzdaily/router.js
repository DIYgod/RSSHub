module.exports = (router) => {
    router.get('/app/:column?', require('./app'));
    router.get('/cmc/:channel?', require('./cmc'));
};
