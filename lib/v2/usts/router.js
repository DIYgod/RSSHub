module.exports = function (router) {
    router.get('/jwch/:type?', require('./jwch'));
};
