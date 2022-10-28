module.exports = function (router) {
    router.get('/download/:val/:id', require('./download'));
};
