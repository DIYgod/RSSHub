module.exports = function (router) {
    router.get('/news/:channel/:sort?', './news');
    router.get('/top/:channel/:sort?', './top');
};
