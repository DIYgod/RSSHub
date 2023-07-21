module.exports = (router) => {
    router.get('/apod', require('./apod'));
    router.get('/apod-ncku', require('./apod-ncku'));
    router.get('/apod-cn', require('./apod-cn'));
};
