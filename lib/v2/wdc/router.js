module.exports = function (router) {
    router.get('/download/:id?', require('./download'));
};
