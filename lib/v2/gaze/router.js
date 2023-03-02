module.exports = function (router) {
    router.get('/update/:mid', require('./update'));
};
