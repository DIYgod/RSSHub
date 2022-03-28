module.exports = function (router) {
    router.get('/news/:channel/:sort?', require('./news'));
    router.get('/top/:channel/:sort?', require('./top'));
};
