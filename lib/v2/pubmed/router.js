module.exports = function (router) {
    router.get('/trending/:filters?', './trending');
};
