module.exports = function (router) {
    router.get('/blog/:language?', './blog');
};
