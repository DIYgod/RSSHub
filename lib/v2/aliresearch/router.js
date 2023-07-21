module.exports = function (router) {
    router.get('/information/:type?', require('./information'));
};
