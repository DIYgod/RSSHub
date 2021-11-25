module.exports = function (router) {
    router.get('/current', require('./current'));
    router.get('/section/:id', require('./section'));
};
