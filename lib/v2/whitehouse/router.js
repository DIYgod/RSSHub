module.exports = (router) => {
    router.get('/briefing-room/:category?', require('./briefing-room'));
};
