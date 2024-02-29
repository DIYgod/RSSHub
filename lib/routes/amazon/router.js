module.exports = function (router) {
    router.get('/awsblogs/:locale?', './awsblogs');
    router.get('/kindle/software-updates', './kindle-software-updates');
};
