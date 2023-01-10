module.exports = function (router) {
    router.get('/links/:name', require('./links'));
};
