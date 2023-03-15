module.exports = function (router) {
    router.get('/blog/:tag?', require('./blog'));
};
