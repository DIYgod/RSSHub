module.exports = function (router) {
    router.get('/release/:version?', './release');
};
