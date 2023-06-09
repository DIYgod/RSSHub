module.exports = function (router) {
    router.get('/paper/:id?', require('./paper'));
};
