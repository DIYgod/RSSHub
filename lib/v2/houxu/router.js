module.exports = function (router) {
    router.get('/events', require('./events'));
    router.get('/featured', require('./index'));
    router.get('/index', require('./index'));
    router.get('/lives/:id', require('./lives'));
    router.get('/memory', require('./memory'));
    router.get('/', require('./index'));
};
