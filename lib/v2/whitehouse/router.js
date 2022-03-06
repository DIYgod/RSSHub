module.exports = (router) => {
    router.get('/briefing-room/:category?', require('./briefing-room'));
    router.get('/ostp', require('./ostp'));
};
