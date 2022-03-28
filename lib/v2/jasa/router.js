module.exports = function (router) {
    router.get('/latest', require('./latest'));
    router.get('/section/:id', require('./section'));
};
