module.exports = function (router) {
    router.get('/download/:os?', './download');
};
