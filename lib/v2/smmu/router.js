module.exports = function (router) {
    router.get('/ao/:type', require('./ao'));
};
