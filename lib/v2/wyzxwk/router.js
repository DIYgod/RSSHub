module.exports = function (router) {
    router.get('/article/:id?', require('./article'));
};
