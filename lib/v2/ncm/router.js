module.exports = function (router) {
    router.get('/user/events/:id', require('./userevents'));
};
