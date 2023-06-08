module.exports = function (router) {
    router.get('/latest-magazine/:query?', require('./latest-magazine'));
};
