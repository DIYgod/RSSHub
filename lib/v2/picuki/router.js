module.exports = function (router) {
    router.get('/profile/:id/:displayVideo?', require('./profile'));
};
