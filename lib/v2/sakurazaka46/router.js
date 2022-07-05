module.exports = function (router) {
    router.get('/blog/:id?', require('./blog'));
};
