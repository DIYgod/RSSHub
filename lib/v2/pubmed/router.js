module.exports = function (router) {
    router.get('/trending/:filters?', require('./trending'));
};
