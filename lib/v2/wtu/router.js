module.exports = (router) => {
    router.get('/:type', require('./index'));
    router.get('/job/:type', require('./job'));
};
