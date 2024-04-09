module.exports = function (router) {
    router.get('/profile/:id/:functionalFlag?', require('./profile'));
};
