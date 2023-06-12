module.exports = (router) => {
    router.get('/job/:type', require('./job'));
};
