module.exports = function (router) {
    router.get('/actors/:name/:id', require('./actors'));
};
