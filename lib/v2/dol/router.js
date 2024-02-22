module.exports = (router) => {
    router.get('/announce/:owner?/:province?/:office?', require('./announce'));
};
