module.exports = function (router) {
    router.get('/blog/:maxPage?', require('./blog'));
};
