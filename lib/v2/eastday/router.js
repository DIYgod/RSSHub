module.exports = function (router) {
    router.get('/24/:category?', './24');
    router.get('/portrait', './portrait');
    router.get('/sh', './sh');
};
