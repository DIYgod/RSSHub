module.exports = function (router) {
    router.get('/journals/:name', require('./journals'));
    router.get('/journals/debut/:name', require('./debut'));
};
