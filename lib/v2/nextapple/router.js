module.exports = (router) => {
    router.get('/realtime/:category?', require('./realtime'));
};
