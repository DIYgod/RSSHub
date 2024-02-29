module.exports = function (router) {
    router.get('/freegames/:locale?/:country?', './index');
};
