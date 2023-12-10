module.exports = function (router) {
    router.get('/forum/:id?', require('./forum'));
};
