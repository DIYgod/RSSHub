module.exports = function (router) {
    router.get('/blog/:language?', require('./blog'));
};
