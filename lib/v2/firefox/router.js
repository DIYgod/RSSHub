module.exports = function (router) {
    router.get('/addons/:id', require('./addons'));
    router.get('/breaches', require('./breaches'));
    router.get('/release/:platform?', require('./release'));
};
